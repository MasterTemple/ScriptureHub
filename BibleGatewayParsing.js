const axios = require('axios')
const fs = require('fs')
let {readFile, writeFile} = fs.promises

let {JSDOM} = require('jsdom')

module.exports = {
  NASB(document, translation){
    // console.log(translation);
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
            console.log(`${e.localName} .${e.classList}`);


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
    return data
  },
  NIV(document, translation){
    // console.log(translation);
    let html = document.querySelector(`body > div.nav-content > div > section > div > div > div.passage-resources > section > div.passage-table > div.passage-cols > div > div.passage-col.version-${translation} > div.passage-text > div > div > div.std-text`)
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
    return data
  }
}