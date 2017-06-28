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
		'/settings/:section',
		settingsController.legacyRedirects,
		controller.siteSelection,
		controller.sites
	);
};
