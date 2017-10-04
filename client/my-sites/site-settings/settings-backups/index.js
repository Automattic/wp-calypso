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
import config from 'config';

export default function() {
	if ( config.isEnabled( 'jetpack/activity-log' ) ) {
		page(
			'/settings/backups/:site_id',
			mySitesController.siteSelection,
			mySitesController.navigation,
			settingsController.setScroll,
			settingsController.siteSettings,
			controller.backups
		);
	}
}
