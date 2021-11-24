const axios = require('axios')
const fs = require('fs')

module.exports = async(lang, num) => {
  return new Promise((resolve, reject) => {

    const url = `https://biblehub.com/${lang}/strongs_${num}.htm`
    axios({
      url: url
    }).then((res) => {
      fs.writeFileSync(`./BibleHub/strongs/html/${lang}/${num}.htm`, res.data)

      // fs.writeFileSync(`./BibleHub/strongs/json/${lang}/${num}.json`, JSON.stringify(data, null, 2))
      resolve()
    }).catch( e => {
      resolve()
      // console.log(e.toJSON());
    })
  })
}