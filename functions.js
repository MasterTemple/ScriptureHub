const axios = require('axios')
const fs = require('fs')
let {readFile, writeFile, readdir} = fs.promises

let {JSDOM} = require('jsdom')
let BibleGatewayParsing = require("./BibleGatewayParsing")

let parsingTypes = {
  "NASB": [
    "AKJV","AKJV","AMP","AMP","AMPC","AMPC","ASV","ASV","BRG","BRG","CEB","CEB","CEV","CEV","CJB","CJB","CSB","CSB","DARBY","DARBY","DLNT","DLNT","DRA","DRA","EHV","EHV","ERV","ERV","ESV","ESV","ESVUK","ESVUK","EXB","EXB","GNT","GNT","GNV","GNV","GW","GW","HCSB","HCSB","ICB","ICB","ISV","ISV","JUB","JUB","KJ21","KJV","KJV","LEB","LEB","MEV","MEV","MOUNCE","MOUNCE","MSG","MSG","NABRE","NABRE","NASB","NASB","NASB1995","NASB1995","NCB","NCB","NCV","NCV","NET","NET","NIRV","NIRV","NIVUK","NIVUK","NKJV","NKJV","NLT","NLT","NLV","NLV","NMB","NMB","NOG","NOG","NRSV","NRSV","NRSVA","NRSVA","NRSVACE","NRSVACE","NRSVCE","NRSVCE","NTE","NTE","OJB","OJB","PHILLIPS","PHILLIPS","RGT","RGT","RSV","RSV","RSVCE","RSVCE","TLB","TLB","TLV","TLV","TPT","TPT","VOICE","VOICE","WE","WE","WEB","WEB","WYC","WYC","YLT","YLTKJ21"
  ],
  "NIV": [
    "NIV"
  ]
}

module.exports = {
  async downloadBibleGatewayVerses(book, chapter, translations){
    return new Promise((resolve, reject) => {
      //https://www.biblegateway.com/passage/?search=Philippians%202&version=NASB;NIV;ESV;NKJV;NLT;
      let link = `https://www.biblegateway.com/passage/?search=${book.replace(/\s/g, "%20")}%20${chapter}&version=${translations.join(";")};`
      axios({
        url: link
      }).then(res => {
        fs.writeFileSync(`./BibleGateway/translations/html/${book}/-${translations.join("-")}-/${chapter}.html`, res.data)
        resolve()
      })
    })
  },
  async parseTranslation(book, chapter, translation) {
    return new Promise(async(resolve, reject) => {

      let file = await readFile(`./BibleGateway/translations/html/${book}/${(await readdir(`./BibleGateway/translations/html/${book}`)).find(n => n.includes(`-${translation}-`))}/${chapter}.html`)

      let {document} = (new JSDOM(file)).window

      let type = Object.entries(parsingTypes).find(([k, t])=> t.includes(translation))?.[0] || "NASB"

      // try{
      // if(translation !== "3" && translation !== "YLTKJ21" && !fs.existsSync(`./BibleGateway/translations/json/${book}/${chapter}/${translation}.json`)){
      if(translation !== "3" && translation !== "YLTKJ21"){
        console.log(`Parsing ${book} ${chapter} ${translation}`);
        let data = []
        try{
          data = BibleGatewayParsing[type](document, translation)
        }catch{}
        await writeFile(`./BibleGateway/translations/json/${book}/${chapter}/${translation}.json`, JSON.stringify(data))
      }
      // }catch{
      //   console.log(`${translation} Failed`);
      // }

      resolve()


    })
  },
  async parseBibleGateway(book, chapter, translations) {
    return new Promise(async(resolve, reject) => {
      // let re = new RegExp(`${translation}`)
      // console.log((await readdir(`./BibleGateway/translations/html/${book}`)).find(n => n.includes(`-${translation}-`)))
      // console.log();
      // if(translations.every(e => fs.existsSync(`./BibleGateway/translations/json/${book}/${chapter}/${e}.json`))) {
      //   resolve()
      // }else{
      //   console.log(translations);

      // }
      // resolve()
      let file = await readFile(`./BibleGateway/translations/html/${book}/-${translations.join("-")}-/${chapter}.html`)

      let {document} = (new JSDOM(file)).window


      for( let translation of translations){
      console.log((await readdir(`./BibleGateway/translations/html/${book}`)).find(n => n.includes(`-${translation}-`)))

        let type = Object.entries(parsingTypes).find(([k, t])=> t.includes(translation))?.[0] || "NASB"

        // try{
        // if(translation !== "3" && translation !== "YLTKJ21" && !fs.existsSync(`./BibleGateway/translations/json/${book}/${chapter}/${translation}.json`)){
        if(translation !== "3" && translation !== "YLTKJ21"){
          console.log(`${book} ${chapter} (${translation})`);
          let data = BibleGatewayParsing[type](document, translation)
          await writeFile(`./BibleGateway/translations/json/${book}/${chapter}/${translation}.json`, JSON.stringify(data))
        }
        // }catch{
        //   console.log(`${translation} Failed`);
        // }

        resolve()

      }
    })
  },
  async parseBibleGatewayOld(book, chapter, translations) {
    return new Promise(async(resolve, reject) => {
      let file = await readFile(`./BibleGateway/translations/html/${book}/-${translations.join("-")}-/${chapter}.html`)
      let {document} = (new JSDOM(file)).window
      for( let translation of translations){
        console.log(`Parsing ${book} ${chapter} (${translation})`);

        let html = document.querySelector(`body > div.nav-content > div > section > div > div > div.passage-resources > section > div.passage-table > div.passage-cols > div > div.passage-col.version-${translation} > div.passage-text > div > div`)
        let data = []
        html.childNodes.forEach(({localName, textContent, classList, childNodes}) => {

          let classes = Object.values({...classList})
          if(!classes.includes("crossrefs") && !classes.includes("footnotes") && localName) {
            // localName h3 -> section header
            // localName p -> verses
            if(localName === "h3"){
              data.push({
                header: textContent,
              })
            }
            //paragraphs
            [...childNodes].forEach((eachChildNode) => {
              //individual verses
              let obj = {
                num: 0,
                verse: ""
              }
              eachChildNode.childNodes.forEach(e => {
                let grandChildClasses = Object.values({...e.classList})
                // its the verse number
                if(e.localName === "sup" && grandChildClasses.includes("versenum") || (e.localName === "span" && grandChildClasses.includes("chapternum"))){
                  obj.num = parseInt(e.textContent.match(/\d+/g)[0])
                }
                // its just text
                else if(!e.localName){
                  obj.verse += e.textContent
                }
                else if(!grandChildClasses.includes("crossreference") && !grandChildClasses.includes("footnote")){
                  e.childNodes.forEach((ee) => {
                    if(ee.localName !== "sup"){
                      obj.verse += ee.textContent

                    }
                  })
                }
              })
              if(obj.num){
                data.push(obj)
              }

            })
          }
        })
        await writeFile(`./BibleGateway/translations/json/${book}/${chapter}/${translation}.json`, JSON.stringify(data))
        resolve()

      }
    })
  },
  async mergeInterlinears(book, chapter, lastVerse) {
    return new Promise(async(resolve, reject) => {

      let chapterData = {}
      for(let verse=1;verse<=lastVerse;verse++){
        let file = require(`./BibleHub/json/interlinear/${book}/${chapter}/${verse}.json`)
        chapterData[verse] = file
      }
      await writeFile(`./BibleHub/json/interlinear/${book}/${chapter}.json`, JSON.stringify(chapterData))
      resolve()
    })
  }
}