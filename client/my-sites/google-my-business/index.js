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
import { getSelectedSiteId } from 'state/ui/selectors';
import { getKeyringConnectionsByName } from 'state/sharing/keyring/selectors';
import {
	getGoogleMyBusinessConnectedLocation,
	getGoogleMyBusinessLocations,
} from 'state/selectors';
import { requestSiteSettings } from 'state/site-settings/actions';
import { requestKeyringConnections } from 'state/sharing/keyring/actions';

export default function( router ) {
	router( '/google-my-business', siteSelection, sites, navigation, makeLayout );

	router(
		'/google-my-business/select-business-type/:site',
		redirectLoggedOut,
		siteSelection,
		selectBusinessType,
		navigation,
		makeLayout
	);

	if ( config.isEnabled( 'google-my-business' ) ) {
		router( '/google-my-business/new', redirectLoggedOut, siteSelection, sites, makeLayout );

		router( '/google-my-business/new/:site', redirectLoggedOut, siteSelection, newAccount, navigation, makeLayout );

		router( '/google-my-business/select-location', redirectLoggedOut, siteSelection, sites, makeLayout );

		router(
			'/google-my-business/select-location/:site',
			redirectLoggedOut,
			siteSelection,
			selectLocation,
			navigation,
			makeLayout
		);

		router( '/google-my-business/stats', redirectLoggedOut, siteSelection, sites, makeLayout );

		router( '/google-my-business/stats/:site', redirectLoggedOut, siteSelection, stats, navigation, makeLayout );

		router(
			'/google-my-business/:site',
			siteSelection,
			( context, next ) => {
				const state = context.store.getState();
				const siteId = getSelectedSiteId( state );
				Promise.all( [
					context.store.dispatch( requestKeyringConnections() ),
					context.store.dispatch( requestSiteSettings( siteId ) ),
				] ).then( next );
			},
			context => {
				const state = context.store.getState();
				const siteId = getSelectedSiteId( state );
				const hasConnectedLocation = !! getGoogleMyBusinessConnectedLocation( state, siteId );
				const hasLocationsAvailable = getGoogleMyBusinessLocations( state, siteId ).length > 0;
				const hasAuthenticated =
					getKeyringConnectionsByName( state, 'google-my-business' ).length > 0;

				if ( hasConnectedLocation ) {
					page.redirect( `/google-my-business/stats/${ context.params.site }` );
				} else if ( hasLocationsAvailable ) {
					page.redirect( `/google-my-business/select-location/${ context.params.site }` );
				} else if ( hasAuthenticated ) {
					page.redirect( `/google-my-business/new/${ context.params.site }` );
				} else {
					page.redirect( `/google-my-business/select-business-type/${ context.params.site }` );
				}
			}
		);
	}
}
