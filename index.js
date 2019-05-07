const path = require('path')

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
        sails.router.bind('/admin', (req, res) => { renderView(res, 'pages/admin') })
        sails.router.bind('/admin/:model', actionList)

        sails.log.info('Bucaniere loaded')
      })

      // Bind assets
      // require('./bindAssets')(sails, function (err, result) {
      //   if (err) {
      //     sails.log.error(err)
      //     return cb(err)
      //   }
      //   cb()
      // })

      return cb()
    }
  }

  async function actionList (req, res) {
    const model = req.param('model')
    const total = await sails.models[model].count()
    const all = await sails.models[model].find({ limit: 25 })

    renderView(res, 'pages/list', {
      all,
      model,
      total
    })
  }

  function renderView (res, view, locals) {
    res.view(path.join(BASE_VIEWS_PATH, view),
      Object.assign({}, { layout: path.join(BASE_VIEWS_PATH, 'layouts/layout.ejs') }, locals)
    )
  }
}
