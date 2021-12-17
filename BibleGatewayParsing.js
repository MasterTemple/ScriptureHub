const axios = require('axios')
const fs = require('fs')
let {readFile, writeFile} = fs.promises

let {JSDOM} = require('jsdom')

class verseData {
  verses = [];
  currentVerse = 1;
  text = "";
  addHeader(header){
    this.verses.push({
      header: header
    })
  }
  addVerse(){
    if(this.text.length === 0) return;
    this.verses.push({
      num: this.currentVerse,
      verse: this.text
    })
    this.text = ""
    this.currentVerse++
  }
  addText(str){
    this.text += str
  }

}


module.exports = {
  test(document, translation){
    let data = new verseData()
    let paragraphs = document.querySelector(`body > div.nav-content > div > section > div > div > div.passage-resources > section > div.passage-table > div.passage-cols > div > div.passage-col.version-${translation} > div.passage-text > div > div`).childNodes
    let text = ""
    for(const paragraph of paragraphs){
      // header/title
      if(paragraph.localName === "h3"){
        // data.push({
        //   header: paragraph.textContent
        // })
        data.addHeader(paragraph.textContent)
      }
      // poetry
      else if(paragraph.className === "poetry"){
        // let text = paragraph.textContent.replace(/(\(.*\))|(\[.*\])/g, "")
        // data.addVerse(text)
        paragraph.childNodes.forEach((line) => {
          //i think there is only 1 line element
          line.childNodes.forEach((part) => {
            if(part.localName === "br") {
              // line break
              data.addText("<br>");
            }
            else if(part.localName === "span"){
              part.childNodes.forEach((eachPart) =>{
                if(eachPart.localName === undefined){
                  data.addText(eachPart.textContent)
                }
                else if(eachPart.localName && eachPart.className === "versenum" ){
                  data.addVerse()
                }
              })
            }
          })
        })
        // data.addText()
      }
      // text
      else {
        // each verse
        paragraph.childNodes.forEach((verse) => {
          verse.childNodes.forEach((part) => {
            // normal text
            if(part.localName === undefined){
              data.addText(part.textContent)
            }
            else if(part.localName === "sup" && part.className === "versenum"){
              data.addVerse()
            }
          })

        })
        data.addText("<br>")
      }
    }
    // console.log(data.verses);
    return data.verses
  },
  NASB(document, translation){
    // console.log(translation);
    let html = document.querySelector(`body > div.nav-content > div > section > div > div > div.passage-resources > section > div.passage-table > div.passage-cols > div > div.passage-col.version-${translation} > div.passage-text > div > div`)
    let data = []
    let isFirstVerse = true
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
        // poetry / quoting OT
        // else if(localName === "div" && classes.includes("poetry")){
        //   // console.log(textContent);
        //   [...childNodes].forEach((eachChildNode) => {
        //     [...eachChildNode.childNodes].forEach((eachGrandChildNode) => {
        //       let obj = {
        //         num: 0,
        //         verse: ""
        //       };
        //       [...eachGrandChildNode.childNodes].forEach((ggchildnode) => {
        //         let ggclassList = Object.values({...ggchildnode.classList})
        //         if(!ggclassList.length){
        //           obj.verse += ggchildnode.textContent
        //           console.log(ggchildnode.textContent, ggclassList, obj.num);

        //         }else if(ggclassList.includes("versenum")){
        //           obj.num = parseInt(ggchildnode.textContent);
        //         }
        //       })
        //       if(obj.num) data.push(obj);
        //     })
        //   })
        // }
        // if(localName === "div" && classes.includes("poetry")){
        //   childNodes = [...[...childNodes].childNodes]
        // }
        let poetry = false
        if(localName === "div" && classes.includes("poetry")){
          poetry = true
        }
        //paragraphs
        {
          [...childNodes].forEach((eachChildNode) => {
            //individual verses
          let obj = {
            num: 0,
            verse: ""
          }
          if(poetry){
            [...eachChildNode.childNodes].forEach((eachGrandChildNode) => {
              [...eachGrandChildNode.childNodes].forEach((ggchildnode) => {
                let ggclassList = Object.values({...ggchildnode.classList})
                if(!ggclassList.length){
                  obj.verse += ggchildnode.textContent
                  console.log(ggchildnode.textContent, ggclassList, obj.num);

                }else if(ggclassList.includes("versenum")){
                  obj.num = parseInt(ggchildnode.textContent);
                }
              })
              // if(obj.num) data.push(obj);
            })
          }

          eachChildNode.childNodes.forEach(e => {
            let grandChildClasses = Object.values({...e.classList})
            // its the verse number
            // console.log(`${e.localName} .${e.classList}`);

            // console.log(grandChildClasses);
            if(e.localName === "sup" && grandChildClasses.includes("versenum") || (e.localName === "span" && grandChildClasses.includes("chapternum"))){
              if(isFirstVerse){
                obj.num = 1
                isFirstVerse = false
              }else{
                obj.num = parseInt(e.textContent.match(/\d+/g)[0])
              }
            }
            // else if(grandChildClasses.includes("lines")){
              //   console.log("LINES");
              //   console.log(e.textContent);
            // }
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