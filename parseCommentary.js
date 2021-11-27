const fs = require("fs")
const axios = require("axios")
let jsdom = require('jsdom')
class Element {
  element;
  class;
  text;
  constructor(e, c, t){
    this.element = e
    this.class = c
    this.text = t
  }
}
class Commentary {
  type;
  name;
  elements = [];
  constructor(type, name){
    this.type = type
    this.name = name
  }
}
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

module.exports = async(book, chapter, verse) => {
  return new Promise((resolve, reject) => {
    let file = fs.readFileSync(`./BibleHub/commentaries/html/${book}/${chapter}/${verse}.htm`)

    const {JSDOM} = jsdom
    let {document} = (new JSDOM(file)).window

    let data = []

    let sides = ["left", "cent"]
    sides.forEach((side) => {
      // coms[document.getElementById("comptype").textContent]

      let obj;// = new Commentary(document.querySelector(`#${side}box > div > div.comtype`))
      let childNodes = [...document.querySelector(`.pad${side}`).childNodes]
      // let currentCommentary = ""
      childNodes.forEach((child, c) => {
        // console.log(`${c}. ${child.localName}`);

        if(child.className === "vheading2"){
          if(obj) data.push(obj)
          obj = new Commentary(document.querySelector(`#${side}box > div > div.comtype`).textContent, child.textContent)
          // currentCommentary = child.textContent
          // data[currentCommentary] = []

        }else{
          // try{
          //     console.log(`${c}. ${child.localName}`);
          //   // console.log(child.localName);
          //   if(child.localName === "p" || child.localName === "br"){
          //     console.log(`${c}. ${child.localName}`);
          //     obj.text.push("\n")
          //   }
          //   obj.text.push(child.textContent)
          // }catch{}
          try{
            let el = new Element(child.localName, child.classList?.value || "", child.textContent)
            if(child.localName === "a") {
              el.element = "span"
              el.class = "verse-link"
            }
            obj.elements.push(el)
          }catch(e){
            console.log(`${c}. ${child.localName}`);

            console.log(e)
          }
        }

      })
      data.push(obj)

    })

    fs.writeFileSync(`./BibleHub/json/commentaries/${book}/${chapter}/${verse}.json`, JSON.stringify(data, null, 2))

    // console.log(data)
    resolve()
  })
}