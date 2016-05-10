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

module.exports = function() {
	if ( config.isEnabled( 'manage/plugins/setup' ) ) {
		page( '/plugins/setup', controller.siteSelection, pluginsController.setupPlugins );
		page( '/plugins/setup/:site', controller.siteSelection, pluginsController.setupPlugins );
	}

	if ( config.isEnabled( 'manage/plugins' ) ) {
		page( '/plugins/browse/:category/:site', controller.siteSelection, controller.navigation, pluginsController.browsePlugins );
		page( '/plugins/browse/:siteOrCategory?', controller.siteSelection, controller.navigation, pluginsController.browsePlugins );

		page( '/plugins', controller.siteSelection, controller.navigation, pluginsController.validateFilters.bind( null, 'all' ), pluginsController.plugins.bind( null, 'all' ), controller.sites );

		[ 'active', 'inactive', 'updates' ].forEach( function( filter ) {
			page( '/plugins/' + filter + '/:site_id?', controller.siteSelection, controller.navigation, pluginsController.validateFilters.bind( null, filter ), pluginsController.jetpackCanUpdate.bind( null, filter ), pluginsController.plugins.bind( null, filter ) );
		} );

		page( '/plugins/:plugin/:business_plugin?/:site_id?', controller.siteSelection, controller.navigation, pluginsController.validateFilters.bind( null, null ), pluginsController.plugin );
	}
};
