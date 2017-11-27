/**
 * External dependencies
 *
 * @format
 */

import page from 'page';

/**
 * Internal dependencies
 */
import { navigation, siteSelection, sites } from 'my-sites/controller';
import { show } from './controller';

export default function() {
	page( '/checklist', siteSelection, sites );
	page( '/checklist/:site_id', siteSelection, navigation, show );
}
