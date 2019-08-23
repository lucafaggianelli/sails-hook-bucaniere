const path = require('path')
const fs = require('fs')

const BASE_VIEWS_PATH = path.join(__dirname, '..', 'views/')

// define base locals
const BASE_LOCALS = {
  menuTemplates: fs.readdirSync('./views/emails/')
    .filter(f => f.endsWith('.ejs'))
    .map(f => f.slice(0, -4)),
  layout: path.join(BASE_VIEWS_PATH, 'layouts/layout.ejs')
}

function renderView (res, view, locals) {
  res.view(path.join(BASE_VIEWS_PATH, view),
    Object.assign({}, BASE_LOCALS, locals)
  )
}

module.exports = {
  renderView
}
