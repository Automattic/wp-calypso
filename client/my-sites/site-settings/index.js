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
	/**
	 * Site Settings
	 */
	page( '/settings', controller.siteSelection, settingsController.redirectToGeneral );

	if ( config.isEnabled( 'manage/import' ) ) {
		page( '/settings/import/:site_id', controller.siteSelection, controller.navigation, settingsController.importSite );
		page( '/settings/import/:subsection/:site_id', controller.siteSelection, controller.navigation, settingsController.importSite );
		page( '/settings/import/:subsection(upload)/:importerID/:site_id', controller.siteSelection, controller.navigation, settingsController.importSite );
	}
	if ( config.isEnabled( 'manage/export' ) ) {
		page( '/settings/export/:site_id', controller.siteSelection, controller.navigation, settingsController.exportSite );
	}
	if ( config.isEnabled( 'manage/site-settings/delete-site' ) ) {
		page( '/settings/delete-site/:site_id', controller.siteSelection, controller.navigation, settingsController.setScroll, settingsController.deleteSite );
		page( '/settings/start-over/:site_id', controller.siteSelection, controller.navigation, settingsController.setScroll, settingsController.startOver );
	}
	page( '/settings/:section/:site_id', controller.siteSelection, controller.navigation, settingsController.setScroll, settingsController.siteSettings );
	page( '/settings/:section/:subsection/:site_id', controller.siteSelection, controller.navigation, settingsController.setScroll, settingsController.siteSettings );
	page( '/settings/:section', settingsController.legacyRedirects, controller.siteSelection, controller.sites );
};
