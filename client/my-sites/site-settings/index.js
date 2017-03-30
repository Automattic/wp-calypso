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
	page(
	    '/settings',
		controller.siteSelection,
		settingsController.redirectToGeneral,
		makeLayout,
		clientRender
	);
	page(
	    '/settings/general/:site_id',
		controller.siteSelection,
		controller.navigation,
		settingsController.setScroll,
		settingsController.siteSettings,
		makeLayout,
		clientRender
	);
	page(
	    '/settings/writing/:site_id',
		controller.siteSelection,
		controller.navigation,
		settingsController.setScroll,
		settingsController.siteSettings,
		makeLayout,
		clientRender
	);
	page(
	    '/settings/discussion/:site_id',
		controller.siteSelection,
		controller.navigation,
		settingsController.setScroll,
		settingsController.siteSettings,
		makeLayout,
		clientRender
	);
	page(
	    '/settings/security/:site_id',
		controller.siteSelection,
		controller.navigation,
		settingsController.setScroll,
		settingsController.siteSettings,
		makeLayout,
		clientRender
	);

	page(
	    '/settings/import/:site_id',
		controller.siteSelection,
		controller.navigation,
		settingsController.importSite,
		makeLayout,
		clientRender
	);

	if ( config.isEnabled( 'manage/export/guided-transfer' ) ) {
		page(
		    '/settings/export/guided/:host_slug?/:site_id',
			controller.siteSelection,
			controller.navigation,
			settingsController.guidedTransfer,
			makeLayout,
			clientRender
		);
	}

	if ( config.isEnabled( 'manage/export' ) ) {
		page(
		    '/settings/export/:site_id',
			controller.siteSelection,
			controller.navigation,
			settingsController.exportSite,
			makeLayout,
			clientRender
		);
	}

	if ( config.isEnabled( 'manage/site-settings/delete-site' ) ) {
		page(
		    '/settings/delete-site/:site_id',
			controller.siteSelection,
			controller.navigation,
			settingsController.setScroll,
			settingsController.deleteSite,
			makeLayout,
			clientRender
		);
		page(
		    '/settings/start-over/:site_id',
			controller.siteSelection,
			controller.navigation,
			settingsController.setScroll,
			settingsController.startOver,
			makeLayout,
			clientRender
		);
		page(
		    '/settings/theme-setup/:site_id',
			controller.siteSelection,
			controller.navigation,
			settingsController.setScroll,
			settingsController.themeSetup,
			makeLayout,
			clientRender
		);
	}

	if ( config.isEnabled( 'manage/site-settings/categories' ) ) {
		page(
		    '/settings/taxonomies/:taxonomy/:site_id',
			controller.siteSelection,
			controller.navigation,
			settingsController.setScroll,
			settingsController.taxonomies,
			makeLayout,
			clientRender
		);
	}

	if ( config.isEnabled( 'manage/site-settings/date-time-format' ) ) {
		page(
		    '/settings/date-time-format/:site_id',
			controller.siteSelection,
			controller.navigation,
			settingsController.setScroll,
			settingsController.dateTimeFormat,
			makeLayout,
			clientRender
		);
	}

	page(
	    '/settings/:section',
		settingsController.legacyRedirects,
		controller.siteSelection,
		controller.sites,
		makeLayout,
		clientRender
	);
};
