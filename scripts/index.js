// const ENTER_KEY = "13"
var rightContent = "interlinear"
var apiData = {
  interlinear: [],
  commentary: [],
  context: []
}
async function get(url){

  return new Promise( (resolve, reject) => {
      fetch(url)
      .then(response => {
        try{
          // response.json()
          let res = response.json()
          resolve(res)
        }
        catch{
          resolve()
        }
      })
      // .then(data => resolve(data));
  })
}

async function searchVerse(verse) {
  // verse = verse.replace(/psalm(?=[^s])/gim, "Psalms")
  // verse = verse.replace(/Songs? of Songs/gim, "Song of Songs")
  // let verse = document.getElementById("search").value
  apiData = {
    interlinear: [],
    commentary: [],
    context: []
  }
  console.log(verse);
  document.title = `ScriptureHub - ${verse}`
  // let {book, chapter, start_verse, end_verse} = [...verse.matchAll(/(?<book>\d? ?\S*) (?<chapter>\d{1,3}):(?<start_verse>\d{1,3})-?(?<end_verse>\d{1,3})?/gim
  //   )]?.[0]?.groups

  // // let interlinear = await get(`./../BibleHub/json/interlinear/${book.to}/${chapter}/${start_verse}.json`)
  // let json = await get(`https://raw.githubusercontent.com/MasterTemple/ScriptureHub/main/BibleHub/json/interlinear/${book}/${chapter}/${start_verse}.json`)

  // console.log(json);
  // let int = document.getElementById(rightContent)
  // // console.log(int);
  // int.innerHTML = ""
  // json.forEach( ({word, grk, heb, translit, str, str2, parse}) => {

  //   int.innerHTML += `
  //   <h3>${word} - ${grk || heb} ${translit}</h3>
  //   <h4>${parse}</h4>
  //   <p>${str2}</p>
  //   `
  // })
  let translations = ["web", "kjv", "bbe", ]//"oeb-us"]
  let left = document.querySelector(".first")
  left.innerHTML = ""
  for(let translation of translations){
    let data = await get(`https://bible-api.com/${verse.toLowerCase()}?translation=${translation}`)
    if(!data.reference) continue;
    left.innerHTML += `
    <h3>${data.reference} - ${translation.toUpperCase()}</h3>
    <p>${data.text}</p>
    `
  }
  updateRightContent(document.getElementById("search").value)
}

async function updateRightContent(verse) {

  // passing verse parameter is unnecessary

  // let verse = document.getElementById("search").value
  // document.querySelector("main > .first").style.width = "50%";
  // document.querySelector("main > .second").style.width = "50%";
  verse[0] = verse[0].toUpperCase()
  // document.getElementById("second").innerHTML = ""
  if(rightContent === "interlinear"){
    document.querySelector("main > .first").style.width = "50%";
    document.querySelector("main > .second").style.width = "50%";
    updateInterLinearContent(verse)
  }
  else if(rightContent === "commentary"){
    document.querySelector("main > .first").style.width = "40%";
    document.querySelector("main > .second").style.width = "60%";
    updateCommentaryContent(verse)
  }
  else if(rightContent === "context"){
    document.querySelector("main > .first").style.width = "30%";
    document.querySelector("main > .second").style.width = "70%";
    updateContextContent(verse)
  }
}

async function updateInterLinearContent(verse) {
  let {book, chapter, start_verse, end_verse} = [...verse.matchAll(/(?<book>\d? ?[\w\s]+) (?<chapter>\d{1,3})[:\s](?<start_verse>\d{1,3})-?(?<end_verse>\d{1,3})?/gim
    )]?.[0]?.groups

  // let interlinear = await get(`./../BibleHub/json/interlinear/${book.to}/${chapter}/${start_verse}.json`)
  let json = apiData.interlinear
  let lowerBook = book.toLowerCase()
  if(lowerBook === "psalm"){
    book = "Psalms"
  }else if(lowerBook === "song of solomon" || lowerBook === "songs of solomon" || lowerBook === "song of songs"){
    book = "Songs"
  }
  if(json.length === 0)  {
    json = await get(`https://raw.githubusercontent.com/MasterTemple/ScriptureHub/main/BibleHub/json/interlinear/${book}/${chapter}/${start_verse}.json`)
    apiData['interlinear'] = json
  }
  // console.log(json);
  let int = document.getElementById(rightContent)
  // console.log(int);
  int.innerHTML = ""
  json.forEach( ({word, grk, heb, translit, str, str2, parse, num}) => {
    let strongs = ""
    if(num){
      strongs = ` [${num}]`
    }
    int.innerHTML += `
    <article class="interlinear-card">
    <div class="interlinear-content">
    <h3>${word} - <span class="accent">${grk || heb} ${translit} </span></h3>
    <h4 class="parse"><span class="accent">${parse}</span>${strongs}</h4>
    <p class="definition">${str2}</p>
    </div>
    <svg class="fill-svg arrow" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M8.122 24l-4.122-4 8-8-8-8 4.122-4 11.878 12z"/></svg>
    </article>
    `
  })
}
async function updateCommentaryContent(verse) {
  let {book, chapter, start_verse, end_verse} = [...verse.matchAll(/(?<book>\d? ?\w+) (?<chapter>\d{1,3}):(?<start_verse>\d{1,3})-?(?<end_verse>\d{1,3})?/gim
    )]?.[0]?.groups

  // let interlinear = await get(`./../BibleHub/json/interlinear/${book.to}/${chapter}/${start_verse}.json`)
  let json = apiData.commentary
  let lowerBook = book.toLowerCase()
  if(lowerBook === "psalm"){
    book = "Psalms"
  }else if(lowerBook === "song of solomon" || lowerBook === "songs of solomon" || lowerBook === "song of songs"){
    book = "Songs"
  }
  if(json.length === 0)  {
    json = await get(`https://raw.githubusercontent.com/MasterTemple/ScriptureHub/main/BibleHub/json/commentaries/${book}/${chapter}/${start_verse}.json`)
    apiData['commentary'] = json
  }
  // console.log(json);
  let int = document.getElementById(rightContent)
  // console.log(int);
  int.innerHTML = ""
  json.forEach( ({type, name, text}, c) => {
    // if(name === "Links") continue;
    // int.innerHTML += `<h3>${name}</h3><p>${text.join("")}</p>`
    // let strongs = ""
    // if(num){
    //   strongs = ` [${num}]`
    // }
    int.innerHTML += `
    <article class="commentary-card">
    <div class="commentary-header cmt-${c}" onclick="commentaryDropDown(${c})">
    <div class="commentary-content">
    <h3>${name}</h3>
    </div>
    <svg class="fill-svg arrow" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M8.122 24l-4.122-4 8-8-8-8 4.122-4 11.878 12z"/></svg>
    </div>
    <div class="commentary-text" id="commentary-text-${c}"></div>
    </article>
    `
  })
}
async function updateContextContent(verse) {
  let {book, chapter, start_verse, end_verse} = [...verse.matchAll(/(?<book>\d? ?\w+) (?<chapter>\d{1,3}):(?<start_verse>\d{1,3})-?(?<end_verse>\d{1,3})?/gim
    )]?.[0]?.groups

  // let interlinear = await get(`./../BibleHub/json/interlinear/${book.to}/${chapter}/${start_verse}.json`)
  // let json = await get(`https://raw.githubusercontent.com/MasterTemple/ScriptureHub/main/BibleHub/json/interlinear/${book}/${chapter}/${start_verse}.json`)
  let json = apiData.context
  if(json.length === 0)  {
    json = await get(`https://bible-api.com/${book}%20${chapter}`)
    apiData['context'] = json
  }

  // console.log(json);
  let int = document.getElementById(rightContent)
  // console.log(int);
  int.innerHTML = `<h2 id="book-title">${book} ${chapter}</h2>`
  json.verses.forEach( ({verse, text}) => {

    int.innerHTML += `
    <article class="context-card">
    <div class="context-content">
    <p class="context-verse" id="verse${verse}"><span class="accent verse-num">${verse} </span><span class="verse-text">${text}</span></p>
    </div>
    </article>
    `
    //    <svg class="fill-svg arrow" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M8.122 24l-4.122-4 8-8-8-8 4.122-4 11.878 12z"/></svg>
  })
}
function commentaryDropDown(c) {
  // console.log(document.querySelector(`.cmt-${c} > svg`).style.transform);
  let commentary = document.getElementById(`commentary-text-${c}`)

  if(document.querySelector(`.cmt-${c} > svg`).style.transform === "rotate(90deg)"){
    // document.querySelector(`.cmt-${c} > svg`).style.transform === "rotate(0deg)"
    document.querySelector(`.cmt-${c} > svg`).style.transform = "rotate(0deg)"
    // commentary.textContent = ""
    commentary.innerHTML = ""

  }else{
    document.querySelector(`.cmt-${c} > svg`).style.transform = "rotate(90deg)"
    // commentary.textContent = apiData.commentary[c].text.join("")
    apiData.commentary[c].elements.forEach(e => {
      let txt = ""
      if(e.children.length > 0){
        e.children.forEach((el) => {
          let childElementClass = ""
          if(el.class){
            childElementClass = `class="${el.class}"`
          }
          txt += `<${el.element} ${childElementClass}">${el.text}</${el.element}>`
        })
      }else{
        txt = e.text
      }
      let elementClass = ""
      if(e.class){
        elementClass = `class="${e.class}"`
      }
      commentary.innerHTML +=
      `
      <${e.element} ${elementClass}>${txt}</${e.element}>
      `

    })
  }
  //  {
  //   transform: rotate(90deg);
  // }
  // console.log(c);
  // console.log(apiData.commentary);
  // console.log(apiData.commentary[c]);
}

function changeRightContent(iconClicked) {
  // document.getElementById(`${rightContent}-icon`).style.filter = "grayscale(40%) opacity(0.7)";
  document.getElementById(`${rightContent}-icon`).classList.remove("selected")
  document.getElementById(rightContent).id = iconClicked
  rightContent = iconClicked
  // document.getElementById(`${iconClicked}-icon`).style.filter = "grayscale(0%) opacity(1)";
  document.getElementById(`${iconClicked}-icon`).classList.add("selected")

  // document.getElementById(`${iconClicked}-icon`).value // IM HERE
  updateRightContent(document.getElementById("search").value)
}

document.querySelector("div.passage-col.version-NKJV > div.passage-text > div > div > p > span")
document.addEventListener("DOMContentLoaded", async() => {
  searchVerse("John 1:1")
  document.getElementById("search").value = "John 1:1"
  // document.getElementById(`${rightContent}-icon`).style.filter = "grayscale(0%) opacity(1)";
  document.getElementById(`${rightContent}-icon`).classList.add("selected")
  // console.log(document.getElementById(`${rightContent}-icon`).classList);
  // document.getElementById(`${rightContent}-icon`).style.color = "var(--accent-color)"
  // document.getElementById(`${rightContent}-icon`).style["border-bottom"] = "2px solid var(--accent-color);"
})

document.addEventListener("keyup", function(event) {
  // console.log(event);
  if (event.key === "Enter") {
      searchVerse(document.getElementById("search").value)
  }
});

document.addEventListener("input", (input) => {
  if(input.target.id === "color-picker"){
    document.documentElement.style.setProperty('--accent-color', document.getElementById("color-picker").value);
  }

})