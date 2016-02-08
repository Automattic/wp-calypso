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
	if ( config.isEnabled( 'manage/plugins/browser' ) ) {
		page( '/plugins/browse/:category/:site', controller.siteSelection, controller.navigation, controller.awaitSiteLoaded, controller.isJetpackSite, pluginsController.browsePlugins );
		page( '/plugins/browse/:siteOrCategory?', controller.siteSelection, controller.navigation, controller.awaitSiteLoaded, controller.isJetpackSite, pluginsController.browsePlugins );
	}

	if ( config.isEnabled( 'manage/plugins/setup' ) ) {
		page( '/plugins/setup', controller.siteSelection, controller.navigation, controller.awaitSiteLoaded, controller.isJetpackSite, pluginsController.setupPlugins );
		page( '/plugins/setup/:site', controller.siteSelection, controller.navigation, controller.awaitSiteLoaded, controller.isJetpackSite, pluginsController.setupPlugins );
	}

	if ( config.isEnabled( 'manage/plugins' ) ) {
		page( '/plugins', controller.siteSelection, controller.navigation, controller.awaitSiteLoaded, controller.isJetpackSite, pluginsController.plugins.bind( null, 'all' ) );
		[ 'active', 'inactive', 'updates' ].forEach( function( filter ) {
			page( '/plugins/' + filter + '/:site_id?', controller.siteSelection, controller.navigation, controller.awaitSiteLoaded, controller.isJetpackSite, pluginsController.jetpackCanUpdate.bind( null, filter ), pluginsController.plugins.bind( null, filter ) );
		} );
		page( '/plugins/:plugin/:business_plugin?/:site_id?', controller.siteSelection, controller.navigation, controller.awaitSiteLoaded, controller.isJetpackSite, pluginsController.plugin );
	}
};
