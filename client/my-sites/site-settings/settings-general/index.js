/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import controller from './controller';
import settingsController from 'my-sites/site-settings/settings-controller';
import mySitesController from 'my-sites/controller';

export default function() {
	page(
		'/settings/general/:site_id',
		mySitesController.siteSelection,
		mySitesController.navigation,
		settingsController.setScroll,
		settingsController.siteSettings,
		controller.general,
	);

	page(
		'/settings/delete-site/:site_id',
		mySitesController.siteSelection,
		mySitesController.navigation,
		settingsController.setScroll,
		controller.deleteSite,
	);

	page(
		'/settings/start-over/:site_id',
		mySitesController.siteSelection,
		mySitesController.navigation,
		settingsController.setScroll,
		controller.startOver,
	);

	page(
		'/settings/theme-setup/:site_id',
		mySitesController.siteSelection,
		mySitesController.navigation,
		settingsController.setScroll,
		controller.themeSetup,
	);
}
