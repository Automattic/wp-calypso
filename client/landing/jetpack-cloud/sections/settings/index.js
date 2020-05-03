/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import config from 'config';

import { navigation, siteSelection, sites } from 'my-sites/controller';
import { makeLayout, render as clientRender } from 'controller';
import { settings } from 'landing/jetpack-cloud/sections/settings/controller';

export default function () {
	if ( config.isEnabled( 'jetpack-cloud/settings' ) ) {
		page( '/settings', siteSelection, sites, navigation, makeLayout, clientRender );
		page( '/settings/:site', siteSelection, navigation, settings, makeLayout, clientRender );
	}
}
