/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import controller from 'my-sites/controller';

import adsController from './controller';

module.exports = function() {
	page( '/ads', controller.siteSelection, controller.sites );
	page( '/ads/:site_id', adsController.redirect );
	page( '/ads/:section/:site_id', controller.siteSelection, controller.navigation, adsController.layout );
};
