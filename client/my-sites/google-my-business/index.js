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
	connectToGoogle,
	selectBusinessType,
	showListOfLocations,
	searchForALocation,
	success,
	create,
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

		page( '/google-my-business/connect', siteSelection, sites, makeLayout, clientRender );
		page(
			'/google-my-business/connect/:site_id/',
			siteSelection,
			navigation,
			connectToGoogle,
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

		page( '/google-my-business/success', siteSelection, sites, makeLayout, clientRender );
		page(
			'/google-my-business/success/:site_id/',
			siteSelection,
			navigation,
			success,
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
