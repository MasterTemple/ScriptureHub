let fs = require('fs')
let getVerseData = require('./getVerseData')
let getLocalVerseData = require('./getLocalVerseData')
let getStrongsData = require('./getStrongsData')
let getStrongsJSON = require('./getStrongsJSON')
let references = require('./references.json')
let refs = require('./refs.json')
let getCommentaryData = require('./getCommentaryData')
let parseCommentary = require('./parseCommentary')
let {downloadBibleGatewayVerses, parseBibleGateway, parseTranslation, mergeInterlinears} = require('./functions')
// classes are not necessary, but I thought I might use it cause I never do :)
/*
let referenceList = require('./referenceList.json')

class Reference {
  constructor(book, chapter, verse) {
    this.book = book
    this.chapter = chapter
    this.verse = verse
  }
}

let references = []

referenceList.forEach( ({book, chapters}) => {
  chapters.forEach(({chapter, verses}) => {
    let ref = new Reference(book, parseInt(chapter), parseInt(verses))
    references.push(ref)
  })
})
fs.writeFileSync("./references.json", JSON.stringify(references, null, 2))
*/

async function getDataFromWebsite(references) {
  for(const {book, chapter, verse: verseCount} of references){

    fs.mkdir(`./BibleHub/html/${book}/${chapter}`, { recursive: true }, ()=>{})
    fs.mkdir(`./BibleHub/json/${book}/${chapter}`, { recursive: true }, ()=>{})

    for(let verse = 1; verse <= verseCount; verse++){

      if(fs.existsSync(`./BibleHub/json/${book}/${chapter}/${verse}.json`)) continue;

      console.log(`Downloading: ${book} ${chapter}:${verse}`);

      let data = await getVerseData(book, chapter, verse)

      fs.writeFileSync(`./BibleHub/json/${book}/${chapter}/${verse}.json`, JSON.stringify(data, null, 2))

    }
  }
}
async function getData(references) {
  for(const {book, chapter, verse: verseCount} of references){

    // fs.mkdirSync(`./BibleHub/json/interlinear/${book}/${chapter}`, { recursive: true }, ()=>{})

    for(let verse = 1; verse <= verseCount; verse++){

      if(fs.existsSync(`./BibleHub/json/interlinear/${book}/${chapter}/${verse}.json`)) continue;

      console.log(`Creating: ${book} ${chapter}:${verse}`);

      let data = await getLocalVerseData(book, chapter, verse)
      // console.log(data);
      fs.writeFileSync(`./BibleHub/json/interlinear/${book}/${chapter}/${verse}.json`, JSON.stringify(data, null, 2))
      // fs.writeFileSync(`./BibleHub/json/interlinear/${book}/${chapter}/${verse}.json`, JSON.stringify(data, null, 2))

    }
  }
}
async function getDataFromWebsiteThreaded(references) {
    references.forEach(({book, chapter, verse: verseCount}) =>{

    fs.mkdir(`./BibleHub/html/${book}/${chapter}`, { recursive: true }, ()=>{})
    fs.mkdir(`./BibleHub/json/${book}/${chapter}`, { recursive: true }, ()=>{})

    for(let verse = 1; verse <= verseCount; verse++){

      if(fs.existsSync(`./BibleHub/json/${book}/${chapter}/${verse}.json`)) continue;

      console.log(`Downloading: ${book} ${chapter}:${verse}`);

      getVerseData(book, chapter, verse).then((data) => {
        fs.writeFileSync(`./BibleHub/json/${book}/${chapter}/${verse}.json`, JSON.stringify(data, null, 2))
      })

    }
  })
}
async function getAllStrongsDataFromWebsite() {
  for(let i=1;i<=8674;i++){
    if(fs.existsSync(`./BibleHub/strongs/html/hebrew/${i}.htm`)) continue;
    console.log(`Downloading: Strongs hebrew #${i}`);
    await getStrongsData("hebrew", i)
  }
  for(let i=1;i<=5624;i++){
    if(fs.existsSync(`./BibleHub/strongs/html/greek/${i}.htm`)) continue;
    console.log(`Downloading: Strongs greek #${i}`);
    await getStrongsData("greek", i)
  }
}
async function createStrongsJSON() {
  for(let i=1;i<=8674;i++){
    if(!fs.existsSync(`./BibleHub/strongs/html/hebrew/${i}.htm`)) continue;
    if(fs.existsSync(`./BibleHub/json/strongs/hebrew/${i}.json`)) continue;
    getStrongsJSON("hebrew", i)
  }
  for(let i=1;i<=5624;i++){
    if(!fs.existsSync(`./BibleHub/strongs/html/greek/${i}.htm`)) continue;
    if(fs.existsSync(`./BibleHub/json/strongs/greek/${i}.json`)) continue;
    getStrongsJSON("greek", i)
  }
}
async function createCommentariesFromWebsite(references){
    for(const {book, chapter, verse: verseCount} of references){

      fs.mkdir(`./BibleHub/commentaries/html/${book}/${chapter}`, { recursive: true }, ()=>{})
      fs.mkdir(`./BibleHub/json/commentaries/${book}/${chapter}`, { recursive: true }, ()=>{})

      for(let verse = 1; verse <= verseCount; verse++){

        // if(fs.existsSync(`./BibleHub/json/commentaries/${book}/${chapter}/${verse}.json`)) continue;
        if(fs.existsSync(`./BibleHub/commentaries/html/${book}/${chapter}/${verse}.htm`)) continue;

        console.log(`Downloading ${book} ${chapter}:${verse} Commentary`);
        await getCommentaryData(book, chapter, verse)
        // let data = await getCommentaryData(book, chapter, verse)

        // fs.writeFileSync(`./BibleHub/json/commentaries/${book}/${chapter}/${verse}.json`, JSON.stringify(data, null, 2))

      }
    }
  }
async function parseAllCommentaries(references) {
  /*
  classes with data to get from children
    comtype: overall commentary type, ?
    vheading2: commentary name, ? (more fields are included like links)
    cmt_sub_title: subtitle,
    cmt_word: golden(commentary) word,
    ital: italics
    accented: bold,
    note_emph: (1)
  theres also hrefs in <a>
  */
  for(const {book, chapter, verse: verseCount} of references){
    for(let verse = 1; verse <= verseCount; verse++){
      if(fs.existsSync(`./BibleHub/json/commentaries/${book}/${chapter}/${verse}.json`) || (book === "1 John" && chapter === 1 && verse === 8)) continue;
      console.log(`Parsing ${book} ${chapter}:${verse} Commentary`);
      // console.log(book === "1 John" , chapter === 1 , verse === 8);
      await parseCommentary(book, chapter, verse)

    }
  }

}
async function getTranslationsFromBibleGateway(refs, translations){
  // while(translations)
  let entries = Object.entries(refs)
  for(let [book, chapters] of entries) {
    fs.mkdir(`./BibleGateway/translations/html/${book}/-${translations.join("-")}-`, { recursive: true }, ()=>{})
    // console.log({book, chapters});
    for(let chapter=1;chapter<chapters.length; chapter++){
      if(!fs.existsSync(`./BibleGateway/translations/html/${book}/-${translations.join("-")}-/${chapter}.html`)){
        console.log(`Downloading ${book} ${chapter} (${translations.join(", ")})`);
        await downloadBibleGatewayVerses(book, chapter, translations)
      };
    }
  }
  //https://www.biblegateway.com/passage/?search=Philippians%202&version=NASB;NIV;ESV;NKJV;NLT;
  //https://www.biblegateway.com/passage/?search=Philippians%202&version=NET;KJV;MSG;NRSV;
}

async function parseAllOfBibleGateway(refs, translation) {
  let entries = Object.entries(refs)
  for(let [book, chapters] of entries) {
    for(let chapter=1;chapter<chapters.length; chapter++){
      // once nasb runs through i wont need to make this run anymore
      // fs.mkdir(`./BibleGateway/translations/json/${book}/${chapter}`, { recursive: true }, ()=>{})

      if(!fs.existsSync(`./BibleGateway/translations/json/${book}/${chapter}/${translation}.json`)){
        await parseTranslation(book, chapter, translation)
      }
      // await parseBibleGateway(book, chapter, translations)
    }
  }

}

async function createInterlinearChapters(refs){
  //creates chapters from the interlinear verses
  let entries = Object.entries(refs)
  for(let [book, chapters] of entries) {
    for(let chapter=1;chapter<chapters.length; chapter++){
      console.log(`Creating Interlinear For ${book} ${chapter}`);
      await mergeInterlinears(book, chapter, chapters[chapter]/*verse length*/)
    }
  }
}
// getDataFromWebsite(references)

// getAllStrongsDataFromWebsite()
// fs = fs.promises
// setTimeout(() => {
//   getData(references)
// }, 5000)
// createStrongsJSON()
// createCommentariesFromWebsite(references)
// references = [{book: "John", chapter: 1, verse: 1}]
// parseAllCommentaries(references)
// full list
// let translationList = ["KJ21","ASV","AMP","AMPC","BRG","CSB","CEB","CJB","CEV","DARBY","DLNT","DRA","ERV","EHV","ESV","ESVUK","EXB","GNV","3" ,"GW","GNT","HCSB","ICB","ISV","PHILLIPS","JUB","KJV","AKJV","LEB","TLB","MSG","MEV","MOUNCE","NOG","NABRE","NASB","NASB1995","NCB","NCV","NET","NIRV","NIV","NIVUK","NKJV","NLV","NLT","NMB","NRSV","NRSVA","NRSVACE","NRSVCE","NTE","OJB","TPT","RGT","RSV","RSVCE","TLV","VOICE","WEB","WE","WYC","YLTKJ21","ASV","AMP","AMPC","BRG","CSB","CEB","CJB","CEV","DARBY","DLNT","DRA","ERV","EHV","ESV","ESVUK","EXB","GNV" ,"GW","GNT","HCSB","ICB","ISV","PHILLIPS","JUB","KJV","AKJV","LEB","TLB","MSG","MEV","MOUNCE","NOG","NABRE","NASB","NASB1995","NCB","NCV","NET","NIRV","NIV","NIVUK","NKJV","NLV","NLT","NMB","NRSV","NRSVA","NRSVACE","NRSVCE","NTE","OJB","TPT","RGT","RSV","RSVCE","TLV","VOICE","WEB","WE","WYC","YLT"]

let translationList = ["KJ21","ASV","AMP","AMPC","BRG","CSB","CEB","CJB","CEV","DARBY","DLNT","DRA","ERV","EHV","ESV","ESVUK","EXB","GNV","GW","GNT","HCSB","ICB","ISV","PHILLIPS","JUB","KJV","AKJV","LEB","TLB","MSG","MEV","MOUNCE","NOG","NABRE","NASB","NASB1995","NCB","NCV","NET","NIRV","NIV","NIVUK","NKJV","NLV","NLT","NMB","NRSV","NRSVA","NRSVACE","NRSVCE","NTE","OJB","TPT","RGT","RSV","RSVCE","TLV","VOICE","WEB","WE","WYC","ASV","AMP","AMPC","BRG","CSB","CEB","CJB","CEV","DARBY","DLNT","DRA","ERV","EHV","ESV","ESVUK","EXB","GNV" ,"GW","GNT","HCSB","ICB","ISV","PHILLIPS","JUB","KJV","AKJV","LEB","TLB","MSG","MEV","MOUNCE","NOG","NABRE","NASB","NASB1995","NCB","NCV","NET","NIRV","NIV","NIVUK","NKJV","NLV","NLT","NMB","NRSV","NRSVA","NRSVACE","NRSVCE","NTE","OJB","TPT","RGT","RSV","RSVCE","TLV","VOICE","WEB","WE","WYC","YLT"]
// translationList = ["NASB","NASB1995","NCB","NCV","NET"]
// translationList = ["NET","NIRV","NIV","NIVUK","NKJV"]
// let translations = [
//   // ["NASB", "NIV", "ESV", "NKJV", "NLT"],
//   // ["NET", "KJV", "MSG", "NRSV", "YLT"]

// ]
// // for(let i=0;i<Math.floor(translations/5);i++){
// for(let i=0;i<translationList.length/5;i++){
//   // console.log(i*5, (i*5)+5);
//   translations.push(translationList.slice(i*5, (i*5)+5))
// }
// // console.log(translations);
// // refs = {"1 Timothy":[0,51]}

// translations.forEach((eachGroup) => {

//   // getTranslationsFromBibleGateway(refs, eachGroup)
//   parseAllOfBibleGateway(refs, eachGroup)

// })
// run again with these translations to get the verse i missed

// translationList = ["NASB", "ESV", "NKJV"]
// translationList.forEach(e => {
//   parseAllOfBibleGateway(refs, e)
// })

createInterlinearChapters(refs)