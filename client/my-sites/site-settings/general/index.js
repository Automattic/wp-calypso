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
		settingsController.siteSettings,
		settingsController.setScroll,
		controller.general
	);
}
