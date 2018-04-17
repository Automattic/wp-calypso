/** @format */

/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import config from 'config';
import { makeLayout, redirectLoggedOut } from 'controller';
import { navigation, sites, siteSelection } from 'my-sites/controller';
import { newAccount, selectBusinessType, selectLocation, stats } from './controller';

export default function( router ) {
	router(
		'/google-my-business',
		'/google-my-business/select-business-type'
	);

	router(
		'/google-my-business/select-business-type',
		redirectLoggedOut,
		siteSelection,
		sites,
		makeLayout,
	);

	router(
		'/google-my-business/select-business-type/:site',
		redirectLoggedOut,
		siteSelection,
		selectBusinessType,
		navigation,
		makeLayout,
	);

	if ( config.isEnabled( 'google-my-business' ) ) {
		router(
			'/google-my-business/new',
			redirectLoggedOut,
			siteSelection,
			sites,
			makeLayout,
		);

		router(
			'/google-my-business/new/:site',
			redirectLoggedOut,
			siteSelection,
			newAccount,
			navigation,
			makeLayout,
		);

		router(
			'/google-my-business/select-location',
			redirectLoggedOut,
			siteSelection,
			sites,
			makeLayout,
		);

		router(
			'/google-my-business/select-location/:site',
			redirectLoggedOut,
			siteSelection,
			selectLocation,
			navigation,
			makeLayout,
		);

		router(
			'/google-my-business/stats',
			redirectLoggedOut,
			siteSelection,
			sites,
			makeLayout,
		);

		router(
			'/google-my-business/stats/:site',
			redirectLoggedOut,
			siteSelection,
			stats,
			navigation,
			makeLayout,
		);
	}

	router(
		'/google-my-business/:site',
		( context ) => {
			page.redirect( `/google-my-business/select-business-type/${ context.params.site }` );
		}
	);
}
