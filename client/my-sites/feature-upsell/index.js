/**
 * External dependencies
 */

import page from 'page';

/**
 * Internal dependencies
 */
import { navigation, siteSelection, sites } from 'my-sites/controller';
import controller from './controller';
import config from 'config';
import { makeLayout, render as clientRender } from 'controller';

export default function () {
	if ( config.isEnabled( 'upsell/nudge-a-palooza' ) ) {
		page(
			'/feature/store/:domain',
			siteSelection,
			navigation,
			controller.storeUpsell,
			makeLayout,
			clientRender
		);

		page(
			'/feature/ads/:domain',
			siteSelection,
			navigation,
			controller.wordAdsUpsell,
			makeLayout,
			clientRender
		);

		page(
			'/feature/plugins/:domain',
			siteSelection,
			navigation,
			controller.pluginsUpsell,
			makeLayout,
			clientRender
		);

		page(
			'/feature/themes/:domain',
			siteSelection,
			navigation,
			controller.themesUpsell,
			makeLayout,
			clientRender
		);

		// Specific feature's page
		page( /\/feature\/([a-zA-Z0-9\-]+)$/, siteSelection, sites, makeLayout, clientRender );

		// General features page
		page(
			'/feature/:domain',
			siteSelection,
			navigation,
			controller.features,
			makeLayout,
			clientRender
		);
		page( '/feature', siteSelection, sites, makeLayout, clientRender );
	}
}
