/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import config from 'config';
import controller from './controller';
import mySitesController from 'my-sites/controller';

export default function() {
	if ( config.isEnabled( 'manage/seo' ) ) {
		page( '/settings/seo/:site_id', mySitesController.siteSelection, mySitesController.navigation, controller.seo );
	}
}
