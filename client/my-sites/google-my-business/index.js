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
import { enterAddress, newAccount, selectBusinessType, selectLocation, stats } from './controller';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getKeyringConnectionsByName } from 'state/sharing/keyring/selectors';
import getGoogleMyBusinessLocations from 'state/selectors/get-google-my-business-locations';
import isGoogleMyBusinessLocationConnected from 'state/selectors/is-google-my-business-location-connected';
import isSiteGoogleMyBusinessEligible from 'state/selectors/is-site-google-my-business-eligible';
import { requestSiteKeyrings } from 'state/site-keyrings/actions';
import canCurrentUser from 'state/selectors/can-current-user';
import { requestKeyringConnections } from 'state/sharing/keyring/actions';

const loadKeyringsMiddleware = ( context, next ) => {
	const state = context.store.getState();
	const siteId = getSelectedSiteId( state );
	Promise.all( [
		context.store.dispatch( requestKeyringConnections() ),
		context.store.dispatch( requestSiteKeyrings( siteId ) ),
	] ).then( next );
};

const redirectUnauthorized = ( context, next ) => {
	const state = context.store.getState();
	const siteId = getSelectedSiteId( state );
	const siteIsGMBEligible = isSiteGoogleMyBusinessEligible( state, siteId );
	const canUserManageOptions = canCurrentUser( state, siteId, 'manage_options' );
	if ( ! siteIsGMBEligible || ! canUserManageOptions ) {
		context.redirect( `/stats/${ context.params.site }` );
	}

	next();
};

export default function( router ) {
	if ( ! config.isEnabled( 'google-my-business' ) ) {
		return;
	}

	router( '/google-my-business', siteSelection, sites, navigation, makeLayout );

	if ( config.isEnabled( 'google-my-business-m3' ) ) {
		router( '/google-my-business/create/enter-address',
			redirectLoggedOut,
			siteSelection,
			sites,
			makeLayout
		);

		router(
			'/google-my-business/create/enter-address/:site',
			redirectLoggedOut,
			siteSelection,
			redirectUnauthorized,
			enterAddress,
			navigation,
			makeLayout
		);
	}

	router( '/google-my-business/new', redirectLoggedOut, siteSelection, sites, makeLayout );

	router(
		'/google-my-business/new/:site',
		redirectLoggedOut,
		siteSelection,
		redirectUnauthorized,
		newAccount,
		navigation,
		makeLayout
	);

	router(
		'/google-my-business/select-location',
		redirectLoggedOut,
		siteSelection,
		sites,
		makeLayout
	);

	router(
		'/google-my-business/select-location/:site',
		redirectLoggedOut,
		siteSelection,
		redirectUnauthorized,
		selectLocation,
		navigation,
		makeLayout
	);

	router( '/google-my-business/stats', redirectLoggedOut, siteSelection, sites, makeLayout );

	router(
		'/google-my-business/stats/:site',
		redirectLoggedOut,
		siteSelection,
		redirectUnauthorized,
		loadKeyringsMiddleware,
		( context, next ) => {
			const state = context.store.getState();
			const siteId = getSelectedSiteId( state );
			const siteIsGMBEligible = isSiteGoogleMyBusinessEligible( state, siteId );
			const hasConnectedLocation = isGoogleMyBusinessLocationConnected( state, siteId );
			const hasLocationsAvailable = getGoogleMyBusinessLocations( state, siteId ).length > 0;

			if ( hasConnectedLocation ) {
				next();
			} else if ( hasLocationsAvailable && siteIsGMBEligible ) {
				page.redirect( `/google-my-business/select-location/${ context.params.site }` );
			} else {
				page.redirect( `/stats/${ context.params.site }` );
			}
		},
		stats,
		navigation,
		makeLayout
	);

	router(
		'/google-my-business/select-business-type/:site',
		redirectLoggedOut,
		siteSelection,
		redirectUnauthorized,
		selectBusinessType,
		navigation,
		makeLayout
	);

	router(
		'/google-my-business/:site',
		siteSelection,
		redirectUnauthorized,
		loadKeyringsMiddleware,
		context => {
			const state = context.store.getState();
			const siteId = getSelectedSiteId( state );
			const hasConnectedLocation = isGoogleMyBusinessLocationConnected( state, siteId );
			const hasLocationsAvailable = getGoogleMyBusinessLocations( state, siteId ).length > 0;
			const hasAuthenticated =
				getKeyringConnectionsByName( state, 'google_my_business' ).length > 0;

			if ( hasConnectedLocation ) {
				page.redirect( `/google-my-business/stats/${ context.params.site }` );
			} else if ( hasLocationsAvailable ) {
				page.redirect( `/google-my-business/select-location/${ context.params.site }` );
			} else if ( hasAuthenticated && ! hasLocationsAvailable ) {
				page.redirect( `/google-my-business/new/${ context.params.site }` );
			} else {
				page.redirect( `/google-my-business/select-business-type/${ context.params.site }` );
			}
		}
	);
}
