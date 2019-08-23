const { renderView } = require('./utils')

module.exports = async function (sails, req, res) {
  const url = require('url')
  const template = req.param('template')
  const templateData = req.param('params') ? JSON.parse(req.param('params')) : {}
  let html = null
  let err = null

  if (req.method === 'POST') {
    try {
      await sails.helpers.sendTemplateEmail.with({
        to: req.param('to'),
        subject: 'Sails test email',
        template,
        templateData
      })
    } catch (e) {
      sails.log.error(e)
    }

    res.redirect('back')
  } else {
    try {
      html = await sails.renderView(`emails/${template}`,
        Object.assign({ url, layout: '../layouts/layout-email' }, templateData))
    } catch (e) {
      err = e
    }

    renderView(res, 'pages/template', {
      template,
      html,
      err
    })
  }
}
