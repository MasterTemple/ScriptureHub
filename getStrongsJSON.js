const jsdom = require('jsdom')
const fs = require('fs')
module.exports = async(lang, num) => {

  const {JSDOM} = jsdom
  let file = fs.readFileSync(`./BibleHub/strongs/html/${lang}/${num}.htm`)
  let {document} = (new JSDOM(file)).window
  let references = [...document.querySelectorAll("#leftbox > div.padleft > p > b > a")].map(e => e.textContent)
  let usedWords = [...document.querySelectorAll(`.${lang}3 > b`)].map(e => e.textContent)
  let sentences = [...document.querySelectorAll(`.${lang}3`)].map(e => [...e.childNodes].map(t => t.textContent).join(" ").replace(/\s+/g, " "))
  let data = []
  for(let i=0; i<references.length;i++){
    data.push({
      reference: references[i],
      word: usedWords[i],
      verse: sentences[i],
    })
  }
  fs.writeFileSync(`./BibleHub/json/strongs/${lang}/${num}.json`, JSON.stringify(data, null, 2))

}