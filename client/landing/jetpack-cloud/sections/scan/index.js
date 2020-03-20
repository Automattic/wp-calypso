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
import { scan, scanHistory } from 'landing/jetpack-cloud/sections/scan/controller';

export default function() {
	if ( config.isEnabled( 'jetpack-cloud/scan' ) ) {
		page( '/scan', siteSelection, sites, navigation, makeLayout, clientRender );
		page( '/scan/:site', siteSelection, navigation, scan, makeLayout, clientRender );

		if ( config.isEnabled( 'jetpack-cloud/scan-history' ) ) {
			page(
				'/scan/history/:site/',
				siteSelection,
				navigation,
				scanHistory,
				makeLayout,
				clientRender
			);
		}
	}
}
