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
	searchForALocation,
	success,
	create,
	verify,
	stats,
	address,
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

		page(
			'/google-my-business/search-for-a-location',
			siteSelection,
			sites,
			makeLayout,
			clientRender
		);
		page(
			'/google-my-business/search-for-a-location/:site_id/',
			siteSelection,
			navigation,
			searchForALocation,
			makeLayout,
			clientRender
		);

		page( '/google-my-business/create', siteSelection, sites, makeLayout, clientRender );
		page(
			'/google-my-business/create/:site_id/',
			siteSelection,
			navigation,
			create,
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

		page( '/google-my-business/address', siteSelection, sites, makeLayout, clientRender );
		page(
			'/google-my-business/address/:site_id/',
			siteSelection,
			navigation,
			address,
			makeLayout,
			clientRender
		);
	}
}
