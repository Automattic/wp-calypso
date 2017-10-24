/**
 * External dependencies
 *
 * @format
 */

import page from 'page';

/**
 * Internal dependencies
 */
import { siteSelection, navigation, sites } from 'my-sites/controller';
import adsController from './controller';

export default function() {
	page( '/ads', siteSelection, sites );
	page( '/ads/:site_id', adsController.redirect );
	page( '/ads/:section/:site_id', siteSelection, navigation, adsController.layout );
}
