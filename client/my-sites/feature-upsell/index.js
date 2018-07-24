/** @format */

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
import { getSiteFragment } from 'lib/route';

export default function() {
	if ( config.isEnabled( 'upsell/nudge-a-palooza' ) ) {
		page( '/feature/:feature', siteSelection, sites, makeLayout, clientRender );
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

		page( '/feature/:feature/*', ( { path, params } ) => {
			const siteFragment = getSiteFragment( path );

			if ( siteFragment ) {
				return page.redirect( `/feature/${ params.feature }/${ siteFragment }` );
			}

			return page.redirect( `/feature/${ params.feature }` );
		} );
	}
}
