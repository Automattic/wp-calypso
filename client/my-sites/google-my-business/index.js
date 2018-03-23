/** @format */

/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { navigation, siteSelection, sites } from 'my-sites/controller';
import {
	selectBusinessType,
	showListOfLocations,
	verify,
	newGMB,
	stats,
	create,
} from './controller';
import config from 'config';
import { makeLayout, render as clientRender } from 'controller';

export default function() {
	if ( config.isEnabled( 'google-my-business' ) ) {
		page( '/google-my-business', siteSelection, sites, makeLayout, clientRender );
		page(
			'/google-my-business/:site_id/',
			siteSelection,
			navigation,
			selectBusinessType,
			makeLayout,
			clientRender
		);

		page(
			'/google-my-business/show-list-of-locations',
			siteSelection,
			sites,
			makeLayout,
			clientRender
		);
		page(
			'/google-my-business/show-list-of-locations/:site_id/',
			siteSelection,
			navigation,
			showListOfLocations,
			makeLayout,
			clientRender
		);

		page( '/google-my-business/stats', siteSelection, sites, makeLayout, clientRender );
		page(
			'/google-my-business/stats/:site_id/',
			siteSelection,
			navigation,
			stats,
			makeLayout,
			clientRender
		);

		page( '/google-my-business/verify', siteSelection, sites, makeLayout, clientRender );
		page(
			'/google-my-business/verify/:site_id/',
			siteSelection,
			navigation,
			verify,
			makeLayout,
			clientRender
		);

		page( '/google-my-business/new', siteSelection, sites, makeLayout, clientRender );
		page(
			'/google-my-business/new/:site_id/',
			siteSelection,
			navigation,
			newGMB,
			makeLayout,
			clientRender
		);

		page( '/google-my-business/create/:path', siteSelection, sites, makeLayout, clientRender );
		page(
			'/google-my-business/create/:path/:site_id/',
			siteSelection,
			navigation,
			create,
			makeLayout,
			clientRender
		);
	}
}
