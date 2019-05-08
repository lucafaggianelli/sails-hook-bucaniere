const path = require('path')
const fs = require('fs')

/**
 * List of hooks that required for adminpanel to work
 */
var requiredHooks = [
  'blueprints',
  'http',
  'orm',
  'policies',
  'views'
]

const BASE_VIEWS_PATH = path.join(__dirname, 'views/')

// define base locals
const BASE_LOCALS = {
  menuTemplates: fs.readdirSync('./views/emails/')
    .filter(f => f.endsWith('.ejs'))
    .map(f => f.slice(0, -4)),
  layout: path.join(BASE_VIEWS_PATH, 'layouts/layout.ejs')
}

module.exports = function (sails) {
  return {
    defaults: require('./defaults'),

    // configure: require('./lib/configure')(sails),

    initialize: function initialize (cb) {
      // If disabled. Do not load anything
      if (!sails.config.bucaniere) {
        return cb()
      }

      // Set up listener to bind shadow routes when the time is right.
      //
      // Always wait until after router has bound static routes.
      // If policies hook is enabled, also wait until policies are bound.
      // If orm hook is enabled, also wait until models are known.
      // If controllers hook is enabled, also wait until controllers are known.
      var eventsToWaitFor = []
      eventsToWaitFor.push('router:after')
      try {
        /**
         * Check hooks availability
         */
        requiredHooks.forEach(hook => {
          if (!sails.hooks[hook]) {
            throw new Error('Cannot use `adminpanel` hook without the `' + hook + '` hook.')
          }
          eventsToWaitFor.push('hook:' + hook + ':loaded')
        })
      } catch (err) {
        if (err) {
          sails.log.error('Error loading Bucaniere hook')
          sails.log.error(err)
          return cb(err)
        }
      }

      sails.after(eventsToWaitFor, () => {
        sails.router.bind('/admin', actionDashboard)
        sails.router.bind('/admin/email-templates/:template', actionTemplate)
        sails.router.bind('/admin/:model', actionList)

        sails.log.info('Bucaniere loaded')
      })

      return cb()
    }
  }

  async function actionDashboard (req, res) {
    const widgets = []

    widgets.push({
      title: 'Users',
      content: await sails.models.user.count()
    })
    widgets.push({
      title: 'Posts',
      content: '189'
    })
    widgets.push({
      title: 'Sales',
      content: '€ 199k'
    })
    widgets.push({
      title: 'Regions',
      content: '4'
    })

    renderView(res, 'pages/dashboard', { widgets })
  }

  async function actionTemplate (req, res) {
    const url = require('url')
    const template = req.param('template')
    let html = null
    let err = null

    try {
      html = await sails.renderView(`emails/${template}`,
        Object.assign({ url, layout: '../layouts/layout-email' }, req.query))
    } catch (e) {
      err = e
    }

    renderView(res, 'pages/template', {
      template,
      html,
      err
    })
  }

  async function actionList (req, res) {
    const model = req.param('model')
    const total = await sails.models[model].count()
    const all = await sails.models[model].find({ limit: 25 })

    renderView(res, 'pages/list', {
      all,
      attributes: sails.models[model].attributes,
      model,
      total
    })
  }

  function renderView (res, view, locals) {
    res.view(path.join(BASE_VIEWS_PATH, view),
      Object.assign({}, BASE_LOCALS, locals)
    )
  }
}
