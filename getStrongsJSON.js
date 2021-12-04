const jsdom = require('jsdom')
let fs = require('fs')
fs = fs.promises
module.exports = async(lang, num) => {
  return new Promise (async(resolve, reject) => {
    console.log(`Strong's ${lang} #${num}`);
    const {JSDOM} = jsdom
    let file = await fs.readFile(`./BibleHub/strongs/html/${lang}/${num}.htm`)
    let {document} = (new JSDOM(file)).window
    // let references = [...document.querySelectorAll("#leftbox > div.padleft > p > b > a")].map(e => e.textContent)
    // let usedWords = [...document.querySelectorAll(`.${lang}3 > b`)].map(e => e.textContent)
    // let sentences = [...document.querySelectorAll(`.${lang}3`)].map(e => [...e.childNodes].map(t => t.textContent).join(" ").replace(/\s+/g, " "))
    // let data = []
    // for(let i=0; i<references.length;i++){
      //   data.push({
        //     reference: references[i],
        //     word: usedWords[i],
        //     verse: sentences[i],
        //   })
        // }

        // let lang = "greek"
    let references = [...document.querySelectorAll("#leftbox > div > p > b > a:nth-child(1)")].map(e => e.textContent)
    let usedWords = [...document.querySelectorAll(`.${lang}3 > b`)].map(e => e.textContent)
    let sentences = [...document.querySelectorAll(`.${lang}3`)].map(e => [...e.childNodes].map(t => t.textContent).join(" ").replace(/\s+/g, " "))
    let data = []
    for(let i=0; i<usedWords.length;i++){
      let word = usedWords[i]
      let verse = sentences[i]
      let verseBeforeRegex = new RegExp(`(?<=[^]+${word})`, "gi")
      let verseBefore = verse.replace(verseBeforeRegex, "")
      let verseAfterRegex = new RegExp(`(?=${word}[^]+)`, "gi")
      let verseAfter = verse.replace(verseAfterRegex, "")
      data.push({
        reference: references[i],
        word: word,
        verse: verse,
        verseBefore: verseBefore,
        verseAfter: verseAfter,
        // verseHTML: sentences[i].replace(usedWords[i], `<span class="">${usedWords[i]}</span>`)
      })
    }
    // console.log(data)

    await fs.writeFile(`./BibleHub/json/strongs/${lang}/${num}.json`, JSON.stringify(data, null, 2))
    resolve()

  })
}