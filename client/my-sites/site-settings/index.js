/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import config from 'config';
import mySitesController from 'my-sites/controller';
import controller from 'my-sites/site-settings/controller';

module.exports = function() {
	page(
		'/settings',
		mySitesController.siteSelection,
		controller.redirectToGeneral
	);
	page(
		'/settings/general/:site_id',
		mySitesController.siteSelection,
		mySitesController.navigation,
		controller.setScroll,
		controller.siteSettings
	);

	page(
		'/settings/import/:site_id',
		mySitesController.siteSelection,
		mySitesController.navigation,
		controller.importSite
	);

	if ( config.isEnabled( 'manage/export/guided-transfer' ) ) {
		page(
			'/settings/export/guided/:host_slug?/:site_id',
			mySitesController.siteSelection,
			mySitesController.navigation,
			controller.guidedTransfer
		);
	}

	if ( config.isEnabled( 'manage/export' ) ) {
		page(
			'/settings/export/:site_id',
			mySitesController.siteSelection,
			mySitesController.navigation,
			controller.exportSite
		);
	}

	page(
		'/settings/delete-site/:site_id',
		mySitesController.siteSelection,
		mySitesController.navigation,
		controller.setScroll,
		controller.deleteSite
	);
	page(
		'/settings/start-over/:site_id',
		mySitesController.siteSelection,
		mySitesController.navigation,
		controller.setScroll,
		controller.startOver
	);
	page(
		'/settings/theme-setup/:site_id',
		mySitesController.siteSelection,
		mySitesController.navigation,
		controller.setScroll,
		controller.themeSetup
	);

	page(
		'/settings/:section',
		controller.legacyRedirects,
		mySitesController.siteSelection,
		mySitesController.sites
	);
};
