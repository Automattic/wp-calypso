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
import { makeLayout, render as clientRender } from 'controller';

export default function() {
	if ( config.isEnabled( 'google-my-business' ) ) {
		page( '/gmb', siteSelection, sites, makeLayout, clientRender );
		page( '/gmb/:site_id/', siteSelection, navigation, show, makeLayout, clientRender );
	}
}
