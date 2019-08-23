const { renderView } = require('./utils')

module.exports = async function (sails, req, res) {
  const widgets = []

  for (const widget of sails.config.bucaniere.widgets) {
    widgets.push({
      ...widget,
      content: await sails.models[widget.model].count()
    })
  }

  renderView(res, 'pages/dashboard', { widgets })
}
