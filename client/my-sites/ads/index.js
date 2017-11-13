/** @format */
/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { navigation, siteSelection, sites } from 'my-sites/controller';
import adsController from './controller';

export default function() {
	page( '/ads', siteSelection, sites );
	page( '/ads/:site_id', adsController.redirect );
	page( '/ads/:section/:site_id', siteSelection, navigation, adsController.layout );
}
