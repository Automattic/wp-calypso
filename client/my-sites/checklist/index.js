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
import config from 'config';

export default function() {
	if ( config.isEnabled( 'onboarding-checklist' ) ) {
		page( '/checklist', siteSelection, sites );
		page( '/checklist/:site_id', siteSelection, navigation, show );
	}
}
