const fs = require('fs')

const cheerio = require('cheerio')
const http = require('axios')


function parsePage (html) {

  const $ = cheerio.load(html)
  const items = $('.lister-item')

  var pageData = []
// console.log(items)
  items.each(function(i, node) {
    
    const title = $(node).find('.lister-item-header a').text()
    const year = +($(node).find('.lister-item-year').text().replace('(', '').replace(')', ''))
    const certificate = $(node).find('.lister-item-content .certificate').text()
    const runtime = $(node).find('.lister-item-content .runtime').text().replace(' min','')
    const genre = $(node).find('.lister-item-content .genre').text().trim()
    const filmcontent = $($(node).find('.lister-item-content p')[1]).text().trim()
    const director = $($(node).find('.lister-item-content p')[2])
      .text()
      .split('Director')[1]
      .split('|')[0]
      .replace(/\n/g,'')
      .split(',')
      .map(function(d) {
        return d.trim().replace(/^\w?\:/, '') // remove leading ":"
      })

    const gross = $($(node).find('.lister-item-content p')[3]).text().split('Gross:').pop().trim().replace('$', '').replace('M', '')
    // debugger

    pageData.push({
      title,
      year,
      certificate,
      runtime,
      genre,
      filmcontent,
      director,
      gross
    })
  })

  return pageData
}


http.get('https://www.imdb.com/list/ls009480135/?sort=release_date,asc&st_dt=&mode=detail&page=1')
.then(function(page) {
  const movies = []
  const parsed = parsePage(page.data)

  fs.writeFileSync('./imdb-oscar.json', JSON.stringify(parsed, null, 2))
})