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

class verseElement {
  type;
  content;
  constructor(type, content){
    this.type = type;
    this.content = content
  }
  addText(text){
    this.content += text;
  }
  addPoetry(text){
    this.content.push(text)
  }
}

class verseArray {
  verses;
  currentVerse;
  element;
  constructor(){
    this.verses = [[], []];
    this.currentVerse = 1;
    this.element = new verseElement("start",)
  }
  getVerses(){

    return this.verses;
    // this.verses.forEach((verse) => {
    //   // this is cause the first element might be undefined
    //   // verse.filter(each => each.type !== "start");
    //   verse.filter(each => each);
    // })
    // this.verses[1] = this.verses[1].filter(each => each.type !== "start")
    // this.verses.forEach((verse) => {
    //   verse = verse.slice(1);
    // })
    // this.verses[1] = this.verses[1].slice(1);
    let data = []
    console.log(this.verses);
    this.verses.forEach((verse, c) => {

      let arr = []
      verse.forEach((part, counter) => {
        let offset = 1

        while(next.type === "prose"){

        }
        // let next = verse?.[counter+1];
        // if(part.type === "prose" && next?.type === "prose"){
        //   part.content = part.content + next.content
        //   ne
        // }
      })
      // console.log({verse});
      // let currentType = verse[0]?.type
      // let currentText = ""
      // for(const part of verse){
      //   if(part.type === currentType){
      //     currentText += part.content
      //   }else{
      //     arr.push({
      //       type: currentType,
      //       content: currentText
      //     })
      //     currentType = part.type
      //     currentText = part.content

      //   }
      // }
      data.push(arr)

    })
    return this.verses;
  }
  incrementVerse(){
    // this.verses[this.currentVerse].push(this.element);
    // this.element = new verseElement("start",)
    this.currentVerse++;
    this.verses.push([]);
  }
  addHeader(text){
    this.element = new verseElement("header", text)
    this.verses[this.currentVerse].push(this.element);
  }
  addPoetry(text){
    // this.element = new verseElement("poetry", text)
    // this.verses[this.currentVerse].push(this.element);

        let currentElement = this.verses[this.currentVerse][this.verses[this.currentVerse].length-1]
    // console.log({currentElement});
    if(currentElement?.type === "poetry" && text !== ""){
      currentElement.content = currentElement.content + text
    }else{
      this.element = new verseElement("poetry", text)
      this.verses[this.currentVerse].push(this.element);
    }

  }
  addProse(text){
    // let currentElement = this.verses[this.currentVerse].slice(-1)[0]
    let currentElement = this.verses[this.currentVerse][this.verses[this.currentVerse].length-1]
    // console.log({currentElement});
    if(currentElement?.type === "prose"){
      currentElement.content = currentElement.content + text
    }else{
      this.element = new verseElement("prose", text)
      this.verses[this.currentVerse].push(this.element);
    }
  }

}

module.exports = (document, translation) => {
let data = new verseArray()
    const paragraphs = document.querySelector(`body > div.nav-content > div > section > div > div > div.passage-resources > section > div.passage-table > div.passage-cols > div > div.passage-col.version-${translation} > div.passage-text > div > div`).childNodes
    for(const paragraph of paragraphs){
      // header
      if(paragraph.localName === "h3"){
        data.addHeader(paragraph.textContent)
      }
      // poetry
      else if(paragraph.className === "poetry"){
        for(const line of paragraph.childNodes){
          for(const part of line.childNodes){
            if(part.localName === "br"){
              data.addPoetry("");
            }
            else if(part.localName === "span"){
              for(const eachpart of part.childNodes){
                if(eachpart.localName === undefined){

                  data.addPoetry(eachpart.textContent);
                }
                else if(eachpart.localName && eachpart.className === "versenum"){
                  data.incrementVerse();
                }
              }
            }
          }
        }
      }
      //
      else if(paragraph.className === "footnotes"){
        return data.getVerses();
      }
      // prose
      else{
        for(const verse of paragraph.childNodes){
          for(const part of verse.childNodes){
            // normal text
            if(part.localName === undefined){
              data.addProse(part.textContent);
            }
            else if(part.localName === "sup" && part.className === "versenum"){
              data.incrementVerse();
            }
          }
        }
      }
    }
    return data.getVerses();
}