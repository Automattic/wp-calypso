import config from '@automattic/calypso-config';
import { FEATURE_GOOGLE_MY_BUSINESS } from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import { makeLayout } from 'calypso/controller';
import { navigation, sites, siteSelection } from 'calypso/my-sites/controller';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import getGoogleMyBusinessLocations from 'calypso/state/selectors/get-google-my-business-locations';
import isGoogleMyBusinessLocationConnected from 'calypso/state/selectors/is-google-my-business-location-connected';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { requestKeyringConnections } from 'calypso/state/sharing/keyring/actions';
import { requestKeyringServices } from 'calypso/state/sharing/services/actions';
import { requestSiteKeyrings } from 'calypso/state/site-keyrings/actions';
import { getSiteKeyringsForService } from 'calypso/state/site-keyrings/selectors';
import { fetchSiteFeatures } from 'calypso/state/sites/features/actions';
import { getSiteHomeUrl } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { newAccount, selectBusinessType, selectLocation, stats } from './controller';

import './style.scss';

const loadKeyringsMiddleware = ( context, next ) => {
	const state = context.store.getState();
	const siteId = getSelectedSiteId( state );
	Promise.all( [
		context.store.dispatch( requestKeyringServices() ),
		context.store.dispatch( requestKeyringConnections() ),
		context.store.dispatch( requestSiteKeyrings( siteId ) ),
	] ).then( next );
};
const loadSiteFeaturesMiddleware = ( context, next ) => {
	const state = context.store.getState();
	const siteId = getSelectedSiteId( state );

	context.store.dispatch( fetchSiteFeatures( siteId ) ).then( next );
};

const redirectUnauthorized = ( context, next ) => {
	const state = context.store.getState();
	const siteId = getSelectedSiteId( state );
	const siteIsGMBEligible = siteHasFeature( state, siteId, FEATURE_GOOGLE_MY_BUSINESS );
	const canUserManageOptions = canCurrentUser( state, siteId, 'manage_options' );
	if ( ! siteIsGMBEligible || ! canUserManageOptions ) {
		page.redirect( getSiteHomeUrl( state, siteId ) );
	}

	next();
};

export default function ( router ) {
	if ( ! config.isEnabled( 'google-my-business' ) ) {
		return;
	}

	router( '/google-my-business', siteSelection, sites, navigation, makeLayout );

	router( '/google-my-business/new', siteSelection, sites, makeLayout );

	router(
		'/google-my-business/new/:site',
		siteSelection,
		loadSiteFeaturesMiddleware,
		redirectUnauthorized,
		newAccount,
		navigation,
		makeLayout
	);

	router( '/google-my-business/select-location', siteSelection, sites, makeLayout );

	router(
		'/google-my-business/select-location/:site',
		siteSelection,
		loadSiteFeaturesMiddleware,
		redirectUnauthorized,
		selectLocation,
		navigation,
		makeLayout
	);

	router( '/google-my-business/stats', siteSelection, sites, makeLayout );

	router(
		'/google-my-business/stats/:site',
		siteSelection,
		loadSiteFeaturesMiddleware,
		redirectUnauthorized,
		loadKeyringsMiddleware,
		( context, next ) => {
			const state = context.store.getState();
			const siteId = getSelectedSiteId( state );
			const siteIsGMBEligible = siteHasFeature( state, siteId, FEATURE_GOOGLE_MY_BUSINESS );
			const hasConnectedLocation = isGoogleMyBusinessLocationConnected( state, siteId );
			const hasLocationsAvailable = getGoogleMyBusinessLocations( state, siteId ).length > 0;

			if ( hasConnectedLocation ) {
				next();
			} else if ( hasLocationsAvailable && siteIsGMBEligible ) {
				page.redirect( `/google-my-business/select-location/${ context.params.site }` );
			} else {
				page.redirect( getSiteHomeUrl( state, siteId ) );
			}
		},
		stats,
		navigation,
		makeLayout
	);

	router(
		'/google-my-business/select-business-type/:site',
		siteSelection,
		loadSiteFeaturesMiddleware,
		redirectUnauthorized,
		selectBusinessType,
		navigation,
		makeLayout
	);

	router(
		'/google-my-business/:site',
		siteSelection,
		loadSiteFeaturesMiddleware,
		redirectUnauthorized,
		loadKeyringsMiddleware,
		( context ) => {
			const state = context.store.getState();
			const siteId = getSelectedSiteId( state );
			const hasConnectedLocation = isGoogleMyBusinessLocationConnected( state, siteId );
			const hasLocationsAvailable = getGoogleMyBusinessLocations( state, siteId ).length > 0;
			const hasAuthenticated =
				getSiteKeyringsForService( state, siteId, 'google_my_business' ).length > 0;

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
