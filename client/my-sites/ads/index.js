/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import adsController from './controller';
import controller from 'my-sites/controller';

export default function() {
	page( '/ads', controller.siteSelection, controller.sites );
	page( '/ads/:site_id', adsController.redirect );
	page( '/ads/:section/:site_id', controller.siteSelection, controller.navigation, adsController.layout );
}
