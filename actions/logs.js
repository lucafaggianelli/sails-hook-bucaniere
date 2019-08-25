const path = require('path')
const { renderView } = require('./utils')

module.exports = async function (sails, req, res) {
  if (req.param('action') === 'read') {
    // the path ./ is relative to sails main app, not to this hook
    const logAbsolutePath = path.resolve('./', sails.config.bucaniere.logfile)

    // try {
    return res.sendFile(logAbsolutePath)
    // } catch (e) {
    //   sails.log.error(e)
    // }
  }

  return renderView(res, 'pages/logs', { })
}
