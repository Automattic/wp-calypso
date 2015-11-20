/**
 * External dependencies
 */
var page = require( 'page' );

/**
 * Internal dependencies
 */
var sharingController = require( './controller' ),
	controller = require( 'my-sites/controller' ),
	config = require( 'config' );


module.exports = function() {
	if ( config.isEnabled( 'manage/sharing' ) ) {
		page( /^\/sharing(\/buttons)?$/, controller.siteSelection, controller.sites );
		page( '/sharing/:domain', controller.siteSelection, controller.navigation, controller.awaitSiteLoaded, controller.jetpackModuleActive( 'publicize', false ), sharingController.connections, sharingController.layout );
		page( '/sharing/buttons/:domain', controller.siteSelection, controller.navigation, controller.awaitSiteLoaded, controller.jetpackModuleActive( 'sharedaddy' ), sharingController.buttons, sharingController.layout );
	}
};
