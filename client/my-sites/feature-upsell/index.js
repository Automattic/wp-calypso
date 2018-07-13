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
		page( '/feature/store', siteSelection, sites, makeLayout, clientRender );

		page(
			'/feature/store/:domain',
			siteSelection,
			navigation,
			controller.storeUpsell,
			makeLayout,
			clientRender
		);

		page( '/feature/store/*', ( { path } ) => {
			const siteFragment = getSiteFragment( path );

			if ( siteFragment ) {
				return page.redirect( `/feature/store/${ siteFragment }` );
			}

			return page.redirect( '/feature/store' );
		} );
	}
}
