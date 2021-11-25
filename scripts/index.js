// const ENTER_KEY = "13"
var rightContent = "interlinear"
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
  // let verse = document.getElementById("search").value
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
  // let verse = document.getElementById("search").value
  verse[0] = verse[0].toUpperCase()
  // document.getElementById("second").innerHTML = ""
  if(rightContent === "interlinear"){
    updateInterLinearContent(verse)
  }
  else if(rightContent === "commentary"){
    updateCommentaryContent(verse)
  }
  else if(rightContent === "context"){
    updateContextContent(verse)
  }
}

async function updateInterLinearContent(verse) {
  let {book, chapter, start_verse, end_verse} = [...verse.matchAll(/(?<book>\d? ?\w+) (?<chapter>\d{1,3}):(?<start_verse>\d{1,3})-?(?<end_verse>\d{1,3})?/gim
    )]?.[0]?.groups

  // let interlinear = await get(`./../BibleHub/json/interlinear/${book.to}/${chapter}/${start_verse}.json`)
  let json = await get(`https://raw.githubusercontent.com/MasterTemple/ScriptureHub/main/BibleHub/json/interlinear/${book}/${chapter}/${start_verse}.json`)

  console.log(json);
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
  // let json = await get(`https://raw.githubusercontent.com/MasterTemple/ScriptureHub/main/BibleHub/json/interlinear/${book}/${chapter}/${start_verse}.json`)

  // console.log(json);
  let int = document.getElementById(rightContent)
  // console.log(int);
  int.innerHTML = ""
  // json.forEach( ({word, grk, heb, translit, str, str2, parse, num}) => {
  //   let strongs = ""
  //   if(num){
  //     strongs = ` [${num}]`
  //   }
  //   int.innerHTML += `
  //   <article class="interlinear-card">
  //   <div class="interlinear-content">
  //   <h3>${word} - <span class="accent">${grk || heb} ${translit} </span></h3>
  //   <h4 class="parse"><span class="accent">${parse}</span>${strongs}</h4>
  //   <p class="definition">${str2}</p>
  //   </div>
  //   <svg class="fill-svg arrow" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M8.122 24l-4.122-4 8-8-8-8 4.122-4 11.878 12z"/></svg>
  //   </article>
  //   `
  // })
}
async function updateContextContent(verse) {
  let {book, chapter, start_verse, end_verse} = [...verse.matchAll(/(?<book>\d? ?\w+) (?<chapter>\d{1,3}):(?<start_verse>\d{1,3})-?(?<end_verse>\d{1,3})?/gim
    )]?.[0]?.groups

  // let interlinear = await get(`./../BibleHub/json/interlinear/${book.to}/${chapter}/${start_verse}.json`)
  // let json = await get(`https://raw.githubusercontent.com/MasterTemple/ScriptureHub/main/BibleHub/json/interlinear/${book}/${chapter}/${start_verse}.json`)

  // console.log(json);
  let int = document.getElementById(rightContent)
  // console.log(int);
  int.innerHTML = ""
  // json.forEach( ({word, grk, heb, translit, str, str2, parse, num}) => {
  //   let strongs = ""
  //   if(num){
  //     strongs = ` [${num}]`
  //   }
  //   int.innerHTML += `
  //   <article class="interlinear-card">
  //   <div class="interlinear-content">
  //   <h3>${word} - <span class="accent">${grk || heb} ${translit} </span></h3>
  //   <h4 class="parse"><span class="accent">${parse}</span>${strongs}</h4>
  //   <p class="definition">${str2}</p>
  //   </div>
  //   <svg class="fill-svg arrow" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M8.122 24l-4.122-4 8-8-8-8 4.122-4 11.878 12z"/></svg>
  //   </article>
  //   `
  // })
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
