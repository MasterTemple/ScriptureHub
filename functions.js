const axios = require('axios')
const fs = require('fs')
module.exports = {
  async downloadBibleGatewayVerses(book, chapter, translations){
    return new Promise((resolve, reject) => {
      
      //https://www.biblegateway.com/passage/?search=Philippians%202&version=NASB;NIV;ESV;NKJV;NLT;
      let link = `https://www.biblegateway.com/passage/?search=${book.replace(/\s/g, "%20")}%20${chapter}&version=${translations.join(";")};`
      axios({
        url: link
      }).then(res => {
        fs.writeFileSync(`./BibleGateway/translations/html/${book}/${translations.join("-")}/${chapter}.html`, res.data)
        resolve()
      })
    })
  }
}