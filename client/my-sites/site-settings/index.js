/**
 * External dependencies
 */
var	page = require( 'page' );

/**
 * Internal dependencies
 */
var config = require( 'config' ),
	controller = require( 'my-sites/controller' ),
	settingsController = require( './controller' );

module.exports = function() {
	page( '/settings', controller.siteSelection, settingsController.redirectToGeneral );
	page( '/settings/security/:site_id', controller.siteSelection, controller.navigation, settingsController.setScroll, settingsController.siteSettings );

	page( '/settings/import/:site_id', controller.siteSelection, controller.navigation, settingsController.importSite );

	if ( config.isEnabled( 'manage/export/guided-transfer' ) ) {
		page( '/settings/export/guided/:host_slug?/:site_id', controller.siteSelection, controller.navigation, settingsController.guidedTransfer );
	}

	if ( config.isEnabled( 'manage/export' ) ) {
		page( '/settings/export/:site_id', controller.siteSelection, controller.navigation, settingsController.exportSite );
	}

	page( '/settings/:section', settingsController.legacyRedirects, controller.siteSelection, controller.sites );
};
