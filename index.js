/**
 * List of hooks that required for adminpanel to work
 */
const requiredHooks = [
  'blueprints',
  'http',
  'orm',
  'policies',
  'views'
]

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
        sails.router.bind(
          '/admin',
          (req, res) => require('./actions/dashboard')(sails, req, res))

        sails.router.bind(
          '/admin/email-templates/:template',
          (req, res) => require('./actions/template')(sails, req, res),
          'get')

        sails.router.bind(
          '/admin/email-templates/:template',
          (req, res) => require('./actions/template')(sails, req, res),
          'post')

        sails.router.bind(
          '/admin/logs/:action?',
          (req, res) => require('./actions/logs')(sails, req, res))

        sails.router.bind(
          '/admin/:model',
          (req, res) => require('./actions/model')(sails, req, res))

        sails.log.info('Bucaniere loaded')
      })

      return cb()
    }
  }
}
