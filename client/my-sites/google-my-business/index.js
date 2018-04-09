/** @format */

/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import config from 'config';
import { makeLayout } from 'controller';
import { navigation, sites, siteSelection } from 'my-sites/controller';
import { newAccount, selectBusinessType, selectLocation, stats } from './controller';

export default function( router ) {
	router(
		'/google-my-business',
		'/google-my-business/select-business-type'
	);

	router(
		'/google-my-business/select-business-type',
		siteSelection,
		sites,
		makeLayout,
	);

	router(
		'/google-my-business/select-business-type/:site',
		siteSelection,
		selectBusinessType,
		navigation,
		makeLayout,
	);

	if ( config.isEnabled( 'google-my-business' ) ) {
		router(
			'/google-my-business/new',
			siteSelection,
			sites,
			makeLayout,
		);

		router(
			'/google-my-business/new/:site',
			siteSelection,
			newAccount,
			navigation,
			makeLayout,
		);

		router(
			'/google-my-business/select-location',
			siteSelection,
			sites,
			makeLayout,
		);

		router(
			'/google-my-business/select-location/:site',
			siteSelection,
			selectLocation,
			navigation,
			makeLayout,
		);

		router(
			'/google-my-business/stats',
			siteSelection,
			sites,
			makeLayout,
		);

		router(
			'/google-my-business/stats/:site',
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
