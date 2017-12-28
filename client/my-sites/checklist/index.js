/**
 * External dependencies
 *
 * @format
 */

import page from 'page';

/**
 * Internal dependencies
 */
import { navigation, siteSelection, sites } from 'client/my-sites/controller';
import { show, thankYou } from './controller';
import config from 'config';
import { makeLayout, render as clientRender } from 'client/controller';

export default function() {
	if ( config.isEnabled( 'onboarding-checklist' ) ) {
		page( '/checklist', siteSelection, sites, makeLayout, clientRender );
		page( '/checklist/:site_id', siteSelection, navigation, show, makeLayout, clientRender );
		page( '/checklist/thank-you/:site/:receiptId?', siteSelection, thankYou );
	}
}
