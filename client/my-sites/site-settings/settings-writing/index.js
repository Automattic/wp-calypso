/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import config from 'config';
import controller from './controller';
import settingsController from 'my-sites/site-settings/settings-controller';
import mySitesController from 'my-sites/controller';

export default function() {
	page(
		'/settings/writing/:site_id',
		mySitesController.siteSelection,
		mySitesController.navigation,
		settingsController.siteSettings,
		controller.writing
	);

	if ( config.isEnabled( 'manage/site-settings/categories' ) ) {
		page(
			'/settings/taxonomies/:taxonomy/:site_id',
			mySitesController.siteSelection,
			mySitesController.navigation,
			settingsController.setScroll,
			controller.taxonomies
		);
	}
}
