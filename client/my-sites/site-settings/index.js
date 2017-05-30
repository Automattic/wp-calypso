/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import config from 'config';
import controller from 'my-sites/controller';
import settingsController from 'my-sites/site-settings/controller';

module.exports = function() {
	page(
		'/settings',
		controller.siteSelection,
		settingsController.redirectToGeneral
	);
	page(
		'/settings/general/:site_id',
		controller.siteSelection,
		controller.navigation,
		settingsController.setScroll,
		settingsController.siteSettings
	);

	page(
		'/settings/import/:site_id',
		controller.siteSelection,
		controller.navigation,
		settingsController.importSite
	);

	if ( config.isEnabled( 'manage/export/guided-transfer' ) ) {
		page(
			'/settings/export/guided/:host_slug?/:site_id',
			controller.siteSelection,
			controller.navigation,
			settingsController.guidedTransfer
		);
	}

	if ( config.isEnabled( 'manage/export' ) ) {
		page(
			'/settings/export/:site_id',
			controller.siteSelection,
			controller.navigation,
			settingsController.exportSite
		);
	}

	page(
		'/settings/delete-site/:site_id',
		controller.siteSelection,
		controller.navigation,
		settingsController.setScroll,
		settingsController.deleteSite
	);
	page(
		'/settings/start-over/:site_id',
		controller.siteSelection,
		controller.navigation,
		settingsController.setScroll,
		settingsController.startOver
	);
	page(
		'/settings/theme-setup/:site_id',
		controller.siteSelection,
		controller.navigation,
		settingsController.setScroll,
		settingsController.themeSetup
	);

	page(
		'/settings/:section',
		settingsController.legacyRedirects,
		controller.siteSelection,
		controller.sites
	);
};
