const fs = require("fs")
const axios = require("axios")
let jsdom = require('jsdom')

module.exports = async(book, chapter, verse) => {
  return new Promise((resolve, reject) => {
    const url = `https://biblehub.com/${book.toLowerCase().replace(/\s/g, "_")}/${chapter}-${verse}.htm`

    axios({
      url: url
    }).then( (res) => {

      fs.writeFileSync(`./BibleHub/html/${book}/${chapter}/${verse}.htm`, res.data)

      const {JSDOM} = jsdom
      let {document} = (new JSDOM(res.data)).window

      let data = []
      const word = [...document.querySelectorAll(".word")].map(e => e.textContent)
      const grk = [...document.querySelectorAll(".grk")].map(e => e.textContent)
      const heb = [...document.querySelectorAll(".heb")].map(e => e.textContent)
      const translit = [...document.querySelectorAll(".translit")].map(e => e.textContent)
      const parse = [...document.querySelectorAll(".parse")].map(e => e.textContent)
      const str = [...document.querySelectorAll(".str")].map(e => e.textContent)
      const str2 = [...document.querySelectorAll(".str2")].map(e => e.textContent)

      for(let i=0; i<word.length;i++){
        data.push({
          word: word[i],
          grk: grk[i],
          heb: heb[i],
          translit: translit[i],
          parse: parse[i],
          str: str[i],
          str2: str2[i],
        })
      }

      resolve(data)


    }).catch((error) => {
      console.log(error);
    })
  })
}