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
import wrapInSiteOffsetProvider from 'lib/jetpack/wrap-in-site-offset';
import {
	showUpsellIfNoScan,
	showUpsellIfNoScanHistory,
	scan,
	scanHistory,
} from 'landing/jetpack-cloud/sections/scan/controller';

export default function () {
	if ( config.isEnabled( 'jetpack-cloud' ) || config.isEnabled( 'jetpack/features-section' ) ) {
		page( '/scan', siteSelection, sites, navigation, makeLayout, clientRender );
		page(
			'/scan/:site',
			siteSelection,
			navigation,
			scan,
			wrapInSiteOffsetProvider,
			showUpsellIfNoScan,
			makeLayout,
			clientRender
		);

		page(
			'/scan/history/:site/:filter?',
			siteSelection,
			navigation,
			scanHistory,
			wrapInSiteOffsetProvider,
			showUpsellIfNoScanHistory,
			makeLayout,
			clientRender
		);
	} else {
		page( '/scan*', () => page.redirect( '/' ) );
	}
}
