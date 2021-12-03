// const ENTER_KEY = "13"
var rightContent = "interlinear"
var primaryTranslation = "ESV"
var previousAccentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-color')
var copyStyle = "default"
var apiData = {
  interlinear: [],
  commentary: [],
  context: [],
  verses: {}
}
var globalVerses = {}
var references

var availableTranslations =
// ["KJ21","ASV","AMP","AMPC","BRG","CSB","CEB","CJB","CEV","DARBY","DLNT","DRA","ERV","EHV","ESV","ESVUK","EXB","GNV","GW","GNT","HCSB","ICB","ISV","PHILLIPS","JUB","KJV","AKJV","LEB","TLB","MSG","MEV","MOUNCE","NOG","NABRE","NASB","NASB1995","NCB","NCV","NET","NIRV","NIV","NIVUK","NKJV","NLV","NLT","NMB","NRSV","NRSVA","NRSVACE","NRSVCE","NTE","OJB","TPT","RGT","RSV","RSVCE","TLV","VOICE","WEB","WE","WYC","ASV","AMP","AMPC","BRG","CSB","CEB","CJB","CEV","DARBY","DLNT","DRA","ERV","EHV","ESV","ESVUK","EXB","GNV" ,"GW","GNT","HCSB","ICB","ISV","PHILLIPS","JUB","KJV","AKJV","LEB","TLB","MSG","MEV","MOUNCE","NOG","NABRE","NASB","NASB1995","NCB","NCV","NET","NIRV","NIV","NIVUK","NKJV","NLV","NLT","NMB","NRSV","NRSVA","NRSVACE","NRSVCE","NTE","OJB","TPT","RGT","RSV","RSVCE","TLV","VOICE","WEB","WE","WYC","YLT"]
["ESV", "NASB", "NKJV", "NET", "NLT", "YLT", "AMP", "NRSV", "MSG"]
// const allVersesRegex = new RegExp(`(${availableTranslations.join("|")})`, "gi")
// const allVersesRegex = new RegExp(`(?<=\d? ?[A-z\s]+\d+: ?\d+-?\d* ?)[A-z]+\d*`, "gim")

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
async function getPassage(book, chapter, translation){

  return new Promise( (resolve, reject) => {
      fetch(`https://raw.githubusercontent.com/MasterTemple/ScriptureHub/main/BibleGateway/translations/json/${book}/${chapter}/${translation}.json`)
      .then(response => {
        try{
          // response.json()
          let res = response.json()
          resolve(res)
          // resolve([translation, res])
        }
        catch{
          resolve([])
        }
      })
      // .then(data => resolve(data));
  })
}

async function searchVerse(verse) {
  verse = verse.replace(/psalm(?=[^s])/gim, "Psalms")
  verse = verse.replace(/Songs? of Songs/gim, "Song of Songs")
  // let verse = document.getElementById("search").value
  // verse[0] = verse[0].toUpperCase()
  verse = verse.replace(/^./g, (m => m.toUpperCase()))

  apiData = {
    interlinear: [],
    commentary: [],
    context: [],
    verses: {}
  }
  console.log(verse);
  document.title = `ScriptureHub - ${verse}`
  let {book, chapter, start_verse, end_verse, givenTranslation} = [...verse.matchAll(/(?<book>\d? ?\S*) (?<chapter>\d{1,3}):?(?<start_verse>\d{1,3})?-?(?<end_verse>\d{1,3})? ?(?<givenTranslation>[A-z0-9]+)?/gim
    )]?.[0]?.groups
  if(!start_verse){
    start_verse = 1
    end_verse = references[book][chapter]
  }
  if(!end_verse) end_verse = start_verse
  if(availableTranslations.includes(givenTranslation?.toUpperCase())){
    // console.log({availableTranslations, givenTranslation, primaryTranslation});
    primaryTranslation = givenTranslation.toUpperCase()
    // console.log({availableTranslations, givenTranslation, primaryTranslation});

  }
  let lowerBook = book.toLowerCase()
  if(lowerBook === "psalm"){
    book = "Psalms"
  }else if(lowerBook === "song of solomon" || lowerBook === "songs of solomon" || lowerBook === "song of songs"){
    book = "Songs"
  }
  start_verse = parseInt(start_verse)
  end_verse = parseInt(end_verse)
  let verseRange = start_verse

  if(end_verse){
    verseRange = `${start_verse}-${end_verse}`
  }
  // loads all the data

  Object.keys(apiData).forEach( async(key) => {
    // if its not already being updated
    if(key !== rightContent){
      if(key === "interlinear"){
        if(!end_verse){
          apiData[key] = [await get(`https://raw.githubusercontent.com/MasterTemple/ScriptureHub/main/BibleHub/json/interlinear/${book}/${chapter}/${start_verse}.json`)]
        }else{
          apiData[key] = await get(`https://raw.githubusercontent.com/MasterTemple/ScriptureHub/main/BibleHub/json/interlinear/${book}/${chapter}.json`)

          apiData[key] = Object.entries(apiData[key]).filter(([k,v]) => parseInt(k)>=start_verse && parseInt(k)<=end_verse).map(([k,v]) => v)
        }
      }
      if(key === "commentary"){
        apiData[key] = await get(`https://raw.githubusercontent.com/MasterTemple/ScriptureHub/main/BibleHub/json/commentaries/${book}/${chapter}/${start_verse}.json`)
      }
      if(key === "context"){
        apiData[key] = await get(`https://raw.githubusercontent.com/MasterTemple/ScriptureHub/main/BibleGateway/translations/json/${book}/${chapter}/${primaryTranslation}.json`)
      }
    }
  })
  updateRightContent(verse)


  let translations = [primaryTranslation, ...availableTranslations.filter(f=>f!==primaryTranslation)]//["NASB", "ESV", "NKJV", ]
  let left = document.querySelector(".first")
  let htmlToAdd = ""
  let firstTimeLoading = false
  if(left.innerHTML.length === 0) firstTimeLoading = true
  let passages = translations.map(t=> getPassage(book, chapter, t))
  passages = await Promise.all(passages)
  // console.log({passages});
  // for(let translation of translations){
  for(let i in translations){
    let translation = translations[i]
  // translations.forEach(async(translation) => {
    // let data = await get(`https://raw.githubusercontent.com/MasterTemple/ScriptureHub/main/BibleGateway/translations/json/${book}/${chapter}/${translation}.json`)
    // let data = passages.find(f=>f[0] === translations)[1]
    let data = passages[i]
    apiData.verses[translation] = data
    let text = ""
    if(!end_verse){
      text = `<p>${data.find(f=>f.num===start_verse)?.verse || ""}</p>`
    }else{
      data.forEach(({header, num, verse}, c) => {
        // console.log({header, num, verse}, c);
        if(header && data[c+1]?.num >= start_verse && data[c+1]?.num <= end_verse){
          // console.log(`header:${header} index:${c}`);

          // console.log(data[c]);
          // console.log(data[c+1]);
          // console.log(`${data[c+1].num} > ${start_verse} && ${data[c+1].num} < ${end_verse}`);

          // console.log(data[c+1].num >= start_verse && data[c+1].num <= end_verse);
          // && data[c+1].num >= start_verse && data[c+1].num <= end_verse
          text = text + `<p class="passage-header">${header}</p>`
        }
        else if(num >= start_verse && num <= end_verse){
          // console.log({header, num, verse});
          text = text + `<p class="passage-verses"><sup class="verse-num">${num} </sup>${verse}</p>`
        }
      })
    }
    globalVerses = {
      book: book,
      chapter: chapter,
      start_verse: start_verse,
      end_verse: end_verse
    }

    // console.log(data);
    // console.log({translation});
    htmlToAdd += `
    <div id="copy-${translation}">
    <div class="copy-verse-header" >
    <h3 id="translation-${translation}">${book} ${chapter}:${verseRange} ${translation}</h3>
    <svg id="${translation}-copy-icon" onclick="copyVerse('${translation}')" width="24px" height="24px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-copy"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
    </div>
    ${text}
    </div>
    `
    if(firstTimeLoading){
      left.innerHTML = htmlToAdd
    }
  }
  if(!firstTimeLoading){
    left.innerHTML = htmlToAdd
  }
  // updateRightContent(document.getElementById("search").value)
  // // loads all the data

  // Object.keys(apiData).forEach( async(key) => {
  //   // if its not already being updated
  //   if(key !== rightContent){
  //     if(key === "interlinear"){
  //       if(!end_verse){
  //         apiData[key] = await get(`https://raw.githubusercontent.com/MasterTemple/ScriptureHub/main/BibleHub/json/interlinear/${book}/${chapter}/${start_verse}.json`)
  //       }else{
  //         apiData[key] = await get(`https://raw.githubusercontent.com/MasterTemple/ScriptureHub/main/BibleHub/json/interlinear/${book}/${chapter}.json`)
  //       }
  //     }
  //     if(key === "commentary"){
  //       apiData[key] = await get(`https://raw.githubusercontent.com/MasterTemple/ScriptureHub/main/BibleHub/json/commentaries/${book}/${chapter}/${start_verse}.json`)
  //     }
  //     if(key === "context"){
  //       apiData[key] = await get(`https://raw.githubusercontent.com/MasterTemple/ScriptureHub/main/BibleGateway/translations/json/${book}/${chapter}/${primaryTranslation}.json`)
  //     }
  //   }
  // })

}

async function updateRightContent(verse) {
  return new Promise (async(resolve, reject) => {

    // passing verse parameter is unnecessary

    // let verse = document.getElementById("search").value
    // document.querySelector("main > .first").style.width = "50%";
    // document.querySelector("main > .second").style.width = "50%";
    // verse[0] = verse[0].toUpperCase()
    // document.getElementById("second").innerHTML = ""
    if(rightContent === "interlinear"){
      document.querySelector("main > .first").style.width = "50%";
      document.querySelector("main > .second").style.width = "50%";
      await updateInterLinearContent(verse)
    }
    else if(rightContent === "commentary"){
      document.querySelector("main > .first").style.width = "40%";
      document.querySelector("main > .second").style.width = "60%";
      await updateCommentaryContent(verse)
    }
    else if(rightContent === "context"){
      document.querySelector("main > .first").style.width = "30%";
      document.querySelector("main > .second").style.width = "70%";
      await updateContextContent(verse)
    }
    resolve()
  })
}

async function updateInterLinearContent(verse) {
  return new Promise (async(resolve, reject) => {
    // console.log(verse);
    let {book, chapter, start_verse, end_verse, givenTranslation} = [...verse.matchAll(/(?<book>\d? ?\S*) (?<chapter>\d{1,3}):?(?<start_verse>\d{1,3})?-?(?<end_verse>\d{1,3})? ?(?<givenTranslation>[A-z0-9]+)?/gim
    )]?.[0]?.groups
    if(!start_verse){
      start_verse = 1
    end_verse = references[book][chapter]
  }
  // let interlinear = await get(`./../BibleHub/json/interlinear/${book.to}/${chapter}/${start_verse}.json`)
  let json = apiData.interlinear
  let lowerBook = book.toLowerCase()
  if(lowerBook === "psalm"){
    book = "Psalms"
  }else if(lowerBook === "song of solomon" || lowerBook === "songs of solomon" || lowerBook === "song of songs"){
    book = "Songs"
  }
  if(json.length === 0)  {
    if(!end_verse){
      json = [await get(`https://raw.githubusercontent.com/MasterTemple/ScriptureHub/main/BibleHub/json/interlinear/${book}/${chapter}/${start_verse}.json`)]
    }else{
      json = await get(`https://raw.githubusercontent.com/MasterTemple/ScriptureHub/main/BibleHub/json/interlinear/${book}/${chapter}.json`)
      json = Object.entries(json).filter(([k,v]) => parseInt(k)>=start_verse && parseInt(k)<=end_verse).map(([k,v]) => v)
      // console.log(json);
    }
    // json = await get(`https://raw.githubusercontent.com/MasterTemple/ScriptureHub/main/BibleHub/json/interlinear/${book}/${chapter}/${start_verse}.json`)
    apiData['interlinear'] = json
  }
  // console.log(json);
  let int = document.getElementById(rightContent)
  // console.log(int);
  int.innerHTML = ""
  let thisVerse = start_verse
  // console.log(json);
  // the following 2 things exist so only the first verse is expanded
  let rotation = 90
  let hideClass = ""
  for(let eachVerse of json){
    // int.innerHTML += `
    // <article class="interlinear-card"
    // id="interlinear-verse-heading-${thisVerse}"
    // onclick="interlinearVerseDropdown(${thisVerse})">
    // <div class="interlinear-content">
    // <h2>Verse ${thisVerse}</h2>
    // </div>
    // <svg class="fill-svg arrow" style="transform:rotate(90deg);" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M8.122 24l-4.122-4 8-8-8-8 4.122-4 11.878 12z"/></svg>
    // </article>
    // <article id="interlinear-section-${thisVerse}">
    // `
    let dataForThisVerse = ""
    for(let {word, grk, heb, translit, str, str2, parse, num} of eachVerse){

    // eachVerse.forEach( ({word, grk, heb, translit, str, str2, parse, num}) => {
      let strongs = ""
      if(num){
        strongs = ` [${num}]`
      }
      // int.innerHTML += `
      dataForThisVerse += `
      <article class="interlinear-card">
      <div class="interlinear-content">
      <h3>${word} - <span class="accent">${grk || heb} ${translit} </span></h3>
      <h4 class="parse"><span class="accent">${parse}</span>${strongs}</h4>
      <p class="definition">${str2}</p>
      </div>
      <svg class="fill-svg arrow" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M8.122 24l-4.122-4 8-8-8-8 4.122-4 11.878 12z"/></svg>
      </article>
      `
      // })
    }
      int.innerHTML += `
      <article class="interlinear-header-article"
      id="interlinear-verse-heading-${thisVerse}"
      >
      <div class="interlinear-verse-container"
      onclick="interlinearVerseDropdown(${thisVerse})">
      <div class="interlinear-content">
      <h2 class="interlinear-verse-header">Verse ${thisVerse}</h2>
      </div>
      <svg class="fill-svg arrow" style="transform:rotate(${rotation}deg);" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M8.122 24l-4.122-4 8-8-8-8 4.122-4 11.878 12z"/></svg>
      </div>

      <article id="interlinear-section-${thisVerse}" ${hideClass}>
      ${dataForThisVerse}
      </article>
      </article>

      `
      // int.innerHTML += `</article>`
      thisVerse++
      rotation = 0
      hideClass = `class="hide-interlinear"`
  }
    resolve()
  })
}
async function updateCommentaryContent(verse) {
  return new Promise (async(resolve, reject) => {
    let {book, chapter, start_verse, end_verse, givenTranslation} = [...verse.matchAll(/(?<book>\d? ?\S*) (?<chapter>\d{1,3}):?(?<start_verse>\d{1,3})?-?(?<end_verse>\d{1,3})? ?(?<givenTranslation>[A-z0-9]+)?/gim
      )]?.[0]?.groups
    if(!start_verse){
      start_verse = 1
      end_verse = references[book][chapter]
    }

    // let interlinear = await get(`./../BibleHub/json/interlinear/${book.to}/${chapter}/${start_verse}.json`)
    let json = apiData.commentary
    let lowerBook = book.toLowerCase()
    if(lowerBook === "psalm"){
      book = "Psalms"
    }else if(lowerBook === "song of solomon" || lowerBook === "songs of solomon" || lowerBook === "song of songs"){
      book = "Songs"
    }
    if(json.length === 0)  {
      // if(!end_verse){
      //   json = await get(`https://raw.githubusercontent.com/MasterTemple/ScriptureHub/main/BibleHub/json/commentaries/${book}/${chapter}/${start_verse}.json`)
      // }else{
      //   json = await get(`https://raw.githubusercontent.com/MasterTemple/ScriptureHub/main/BibleHub/json/commentaries/${book}/${chapter}.json`)
      // }
      json = await get(`https://raw.githubusercontent.com/MasterTemple/ScriptureHub/main/BibleHub/json/commentaries/${book}/${chapter}/${start_verse}.json`)
      apiData['commentary'] = json
    }
    // console.log(json);
    let int = document.getElementById(rightContent)
    // console.log(int);
    int.innerHTML = ""
    json.forEach( ({type, name, text, elements}, c) => {
      // if(name === "Links") continue;
      // int.innerHTML += `<h3>${name}</h3><p>${text.join("")}</p>`
      // let strongs = ""
      // if(num){
      //   strongs = ` [${num}]`
      // }
      let commentaryText = ""
      elements.forEach(e => {
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
        commentaryText +=
        `
        <${e.element} ${elementClass}>${txt}</${e.element}>
        `

      })

      int.innerHTML += `
      <article class="commentary-card">
      <div class="commentary-header cmt-${c}" onclick="commentaryDropDown(${c})">
      <div class="commentary-content">
      <h3>${name}</h3>
      </div>
      <svg class="fill-svg arrow" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M8.122 24l-4.122-4 8-8-8-8 4.122-4 11.878 12z"/></svg>
      </div>
      <div class="commentary-text" id="commentary-text-${c}">${commentaryText}</div>
      </article>
      `
    })

    // apiData.commentary.forEach((com, c) => {
    //   let commentary = document.getElementById(`commentary-text-${c}`)

    //   com.elements.forEach(e => {
    //     let txt = ""
    //     if(e.children.length > 0){
    //       e.children.forEach((el) => {
    //         let childElementClass = ""
    //         if(el.class){
    //           childElementClass = `class="${el.class}"`
    //         }
    //         txt += `<${el.element} ${childElementClass}">${el.text}</${el.element}>`
    //       })
    //     }else{
    //       txt = e.text
    //     }
    //     let elementClass = ""
    //     if(e.class){
    //       elementClass = `class="${e.class}"`
    //     }
    //     commentary.innerHTML +=
    //     `
    //     <${e.element} ${elementClass}>${txt}</${e.element}>
    //     `

    //   })
    // })

  // })
  resolve()
})
}
async function updateContextContent(verse) {
  return new Promise (async(resolve, reject) => {

  let {book, chapter, start_verse, end_verse, givenTranslation} = [...verse.matchAll(/(?<book>\d? ?\S*) (?<chapter>\d{1,3}):?(?<start_verse>\d{1,3})?-?(?<end_verse>\d{1,3})? ?(?<givenTranslation>[A-z0-9]+)?/gim
    )]?.[0]?.groups
  if(!start_verse){
    start_verse = 1
    end_verse = references[book][chapter]
  }

  // let interlinear = await get(`./../BibleHub/json/interlinear/${book.to}/${chapter}/${start_verse}.json`)
  // let json = await get(`https://raw.githubusercontent.com/MasterTemple/ScriptureHub/main/BibleHub/json/interlinear/${book}/${chapter}/${start_verse}.json`)
  let json = apiData.context
  if(json.length === 0)  {
    // json = await get(`https://bible-api.com/${book}%20${chapter}`)
    json = await get(`https://raw.githubusercontent.com/MasterTemple/ScriptureHub/main/BibleGateway/translations/json/${book}/${chapter}/${primaryTranslation}.json`)

    apiData['context'] = json
  }

  // console.log(json);
  let int = document.getElementById(rightContent)
  // console.log(int);
  int.innerHTML = `<h2 id="book-title">${book} ${chapter} ${primaryTranslation}</h2>`
  // json.verses.forEach( ({verse, text}) => {

  //   int.innerHTML += `
  //   <article class="context-card">
  //   <div class="context-content">
  //   <p class="context-verse" id="verse${verse}"><span class="accent verse-num">${verse} </span><span class="verse-text">${text}</span></p>
  //   </div>
  //   </article>
  //   `
  // })
  json.forEach(({header, num, verse}, c) => {
    if(header){
      int.innerHTML += `
      <article class="context-card">
      <div class="context-content">
      <p class="passage-header">${header}</p>
      </div>
      </article>
      `
    }else{
      int.innerHTML += `
      <article class="context-card">
      <div class="context-content">
      <p class="context-verse" id="verse${num}"><span class="accent verse-num">${num} </span><span class="verse-text">${verse}</span></p>
      </div>
      </article>
      `
    }
  })
  resolve()
})
}

function commentaryDropDown(c) {
  // console.log(document.querySelector(`.cmt-${c} > svg`).style.transform);
  let commentary = document.getElementById(`commentary-text-${c}`)

  if(document.querySelector(`.cmt-${c} > svg`).style.transform === "rotate(90deg)"){
    // document.querySelector(`.cmt-${c} > svg`).style.transform === "rotate(0deg)"
    document.querySelector(`.cmt-${c} > svg`).style.transform = "rotate(0deg)"
    // commentary.textContent = ""
    commentary.classList.remove("selected-commentary")
  }else{
    commentary.classList.add("selected-commentary")

    document.querySelector(`.cmt-${c} > svg`).style.transform = "rotate(90deg)"

  }

}
function interlinearVerseDropdown(c) {
  // console.log(document.querySelector(`.cmt-${c} > svg`).style.transform);
  let commentary = document.getElementById(`interlinear-section-${c}`)

  if(document.querySelector(`#interlinear-verse-heading-${c} > .interlinear-verse-container > svg`).style.transform === "rotate(90deg)"){
    // document.querySelector(`.cmt-${c} > svg`).style.transform === "rotate(0deg)"
    document.querySelector(`#interlinear-verse-heading-${c} > .interlinear-verse-container > svg`).style.transform = "rotate(0deg)"
    // commentary.textContent = ""
    commentary.classList.add("hide-interlinear")
  }else{
    commentary.classList.remove("hide-interlinear")

    document.querySelector(`#interlinear-verse-heading-${c} > .interlinear-verse-container > svg`).style.transform = "rotate(90deg)"

  }

}

function commentaryDropDownOld(c) {
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
  document.querySelector(".second").scrollTo(0, 0);

  document.getElementById(`${rightContent}-icon`).classList.remove("selected")
  document.getElementById(rightContent).id = iconClicked
  rightContent = iconClicked
  // document.getElementById(`${iconClicked}-icon`).style.filter = "grayscale(0%) opacity(1)";
  document.getElementById(`${iconClicked}-icon`).classList.add("selected")

  // document.getElementById(`${iconClicked}-icon`).value // IM HERE
  updateRightContent(document.getElementById("search").value)
}

function copyVerse(translation){
  let icon = document.getElementById(`${translation}-copy-icon`)
  icon.classList.add("gold-icon-overwrite")
  setTimeout(function(){
    icon.classList.remove("gold-icon-overwrite")
  }, 750);
  let textToCopy = ""
  if(copyStyle === "default"){
    // textToCopy = "\t"
    apiData.verses[translation].forEach((e, c) => {
      // console.log(`${e.num} >= ${globalVerses.start_verse} && ${e.num} <= ${globalVerses.end_verse}`);
      if(e.num){
        if(e.num >= globalVerses.start_verse && e.num <= globalVerses.end_verse){

          textToCopy += (e.verse + " ")
        }
      }else{
        // if(c===0) textToCopy +="\t"
        // else textToCopy += "\n\t"
      }
    })
    if(globalVerses.end_verse){
      textToCopy += `\n${globalVerses.book} ${globalVerses.chapter}:${globalVerses.start_verse}-${globalVerses.end_verse} ${translation}`
    }else{
      textToCopy += `\n${globalVerses.book} ${globalVerses.chapter}:${globalVerses.start_verse} ${translation}`
    }
    navigator.clipboard.writeText(textToCopy)

    // try{
    //   navigator.clipboard.writeText(textToCopy)
    // }catch(e){console.log(e);}
  }

}

document.querySelector("div.passage-col.version-NKJV > div.passage-text > div > div > p > span")
document.addEventListener("DOMContentLoaded", async() => {
  let initialVerse = "Genesis 1:1"
  searchVerse(initialVerse)
  document.getElementById("search").value = initialVerse
  // document.getElementById(`${rightContent}-icon`).style.filter = "grayscale(0%) opacity(1)";
  document.getElementById(`${rightContent}-icon`).classList.add("selected")
  references = await get("https://raw.githubusercontent.com/MasterTemple/ScriptureHub/main/refs.json")
  document.getElementById("color-picker").value = getComputedStyle(document.documentElement).getPropertyValue('--accent-color')
  // let translationHTML = ""
  // availableTranslations.forEach((e) => {
  //   translationHTML +=`<input type="checkbox" id="check-${e}" name="${e}" class="checkbox" checked="true">${e}</input>`
  // })
  // document.getElementById("translation-box").innerHTML = translationHTML


  let translationHTML = ""
  availableTranslations.forEach((e) => {
    translationHTML +=`<option classs="select" value="${e}">${e}</option>`
  })
  document.getElementById("translation-select").innerHTML = translationHTML
  // console.log(document.getElementById(`${rightContent}-icon`).classList);
  // document.getElementById(`${rightContent}-icon`).style.color = "var(--accent-color)"
  // document.getElementById(`${rightContent}-icon`).style["border-bottom"] = "2px solid var(--accent-color);"
})

document.addEventListener("keyup", function(event) {
  // console.log(event);
  if (event.key === "Enter") {
    document.getElementById("search").value = document.getElementById("search").value.replace(/^./g, (m => m.toUpperCase())).replace(/(?<=^\d? ?[A-z]+)(?=\d+:)/g, " ")
    // verse[0] = verse[0].toUpperCase()

    searchVerse(document.getElementById("search").value)
  }
  if(event.target.id === "search"){
    // console.log(event.target.value);
    // if(event.target.value)
    // console.log(event.target.value.match(/(?<=\d? ?[A-z\s]+\d+: ?\d+-?\d* ?)[A-z]+\d*/gim));
    event.target.value = event.target.value.replace(/(?<=\d? ?[A-z\s]+\d+: ?\d+-?\d* ?)[A-z]+\d*/gim, (m) => m.toUpperCase())
    // event.target.value = event.target.value.replace(/^./g, (m => m.toUpperCase()))
  }
});

document.addEventListener("input", (input) => {
  if(input.target.id === "color-picker"){
    document.documentElement.style.setProperty('--accent-color', document.getElementById("color-picker").value);
  }
})
document.getElementById("cancel-button").addEventListener("click", () => {
  document.documentElement.style.setProperty('--accent-color', previousAccentColor);
})
document.getElementById("confirm-button").addEventListener("click", () => {
  // document.documentElement.style.setProperty('--accent-color', document.getElementById("color-picker").value);
  previousAccentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-color')
  primaryTranslation = document.getElementById("translation-select").value
  availableTranslations = [primaryTranslation, ...availableTranslations.filter(f=>f!==primaryTranslation)]
})

document.getElementById("settings").addEventListener("click", (ev) => {
  // console.log(getComputedStyle(document.documentElement).getPropertyValue('--accent-color'));
  // document.getElementById("color-picker").value = getComputedStyle(document.documentElement).getPropertyValue('--accent-color')
  document.getElementById("settings-dialog").showModal()
})