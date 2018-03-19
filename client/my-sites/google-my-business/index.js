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
	create,
	stats,
	address,
	category,
	connections,
	verify,
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

		page( '/google-my-business/category', siteSelection, sites, makeLayout, clientRender );
		page(
			'/google-my-business/category/:site_id/',
			siteSelection,
			navigation,
			category,
			makeLayout,
			clientRender
		);

		page( '/google-my-business/connections', siteSelection, sites, makeLayout, clientRender );
		page(
			'/google-my-business/connections/:site_id/',
			siteSelection,
			navigation,
			connections,
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
	}
}
