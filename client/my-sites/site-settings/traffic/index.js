/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import controller from './controller';
import mySitesController from 'my-sites/controller';

export default function() {
	page( '/settings/traffic/:site_id', mySitesController.siteSelection, mySitesController.navigation, controller.traffic );
}
