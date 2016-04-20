/**
 * External dependencies
 */
var page = require( 'page' );

/**
 * Internal dependencies
 */
var controller = require( 'my-sites/controller' ),
	config = require( 'config' ),
	pluginsController = require( './controller' );

/**
 * Module variables
 */
var pluginFilters = config.isEnabled( 'manage/plugins/wpcom' )
	? [ 'active', 'inactive', 'updates', 'standard', 'premium', 'business' ]
	: [ 'active', 'inactive', 'updates' ];

module.exports = function() {
	if ( config.isEnabled( 'manage/plugins/setup' ) ) {
		page( '/plugins/setup', controller.siteSelection, controller.navigation, pluginsController.setupPlugins );
		page( '/plugins/setup/:site', controller.siteSelection, controller.navigation, pluginsController.setupPlugins );
	}

	if ( config.isEnabled( 'manage/plugins' ) ) {
		page( '/plugins/browse/:category/:site', controller.siteSelection, controller.navigation, pluginsController.browsePlugins );
		page( '/plugins/browse/:siteOrCategory?', controller.siteSelection, controller.navigation, pluginsController.browsePlugins );

		page( '/plugins', controller.siteSelection, controller.navigation, pluginsController.plugins.bind( null, 'all' ) );

		pluginFilters.forEach( function( filter ) {
			page( '/plugins/' + filter + '/:site_id?', controller.siteSelection, controller.navigation, pluginsController.jetpackCanUpdate.bind( null, filter ), pluginsController.plugins.bind( null, filter ) );
		} );

		page( '/plugins/:plugin/:business_plugin?/:site_id?', controller.siteSelection, controller.navigation, pluginsController.plugin );
	}
};
