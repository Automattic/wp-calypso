/**
 * Internal dependencies
 */
import {
	GOOGLE_MY_BUSINESS_STATS_FAILURE,
	GOOGLE_MY_BUSINESS_STATS_RECEIVE,
	GOOGLE_MY_BUSINESS_STATS_REQUEST,
} from 'state/action-types';
import {
	createSiteKeyring,
	updateSiteKeyring,
	deleteSiteKeyring,
} from 'state/site-keyrings/actions';
import { getSiteKeyringsForService, getSiteKeyringConnection } from 'state/site-keyrings/selectors';

import 'state/data-layer/wpcom/sites/stats/google-my-business';

export const disconnectGoogleMyBusinessAccount = ( siteId, keyringId ) => ( dispatch ) =>
	dispatch( deleteSiteKeyring( siteId, keyringId ) );

export const disconnectAllGoogleMyBusinessAccounts = ( siteId ) => ( dispatch, getState ) =>
	Promise.all(
		getSiteKeyringsForService( getState(), siteId, 'google_my_business' ).map( ( siteKeyring ) =>
			dispatch( disconnectGoogleMyBusinessAccount( siteId, siteKeyring.keyring_id ) )
		)
	);

export const connectGoogleMyBusinessAccount = ( siteId, keyringId, locationId = null ) => (
	dispatch,
	getState
) => {
	if ( getSiteKeyringConnection( getState(), siteId, keyringId ) ) {
		return Promise.resolve();
	}

	return dispatch( disconnectAllGoogleMyBusinessAccounts( siteId ) ).then( () =>
		dispatch(
			createSiteKeyring( siteId, {
				keyring_id: keyringId,
				service: 'google_my_business',
				external_user_id: locationId,
			} )
		)
	);
};

export const connectGoogleMyBusinessLocation = ( siteId, keyringId, locationId ) => ( dispatch ) =>
	dispatch( updateSiteKeyring( siteId, keyringId, locationId ) );

export const disconnectGoogleMyBusinessLocation = ( siteId, keyringId ) => ( dispatch ) =>
	dispatch( updateSiteKeyring( siteId, keyringId, null ) );

export const requestGoogleMyBusinessStats = (
	siteId,
	statType,
	interval = 'week',
	aggregation = 'total'
) => ( {
	type: GOOGLE_MY_BUSINESS_STATS_REQUEST,
	siteId,
	statType,
	interval,
	aggregation,
} );

export const receiveGoogleMyBusinessStats = ( siteId, statType, interval, aggregation, data ) => ( {
	type: GOOGLE_MY_BUSINESS_STATS_RECEIVE,
	siteId,
	statType,
	interval,
	aggregation,
	data,
} );

export const failedRequestGoogleMyBusinessStats = (
	siteId,
	statType,
	interval,
	aggregation,
	error
) => ( {
	type: GOOGLE_MY_BUSINESS_STATS_FAILURE,
	siteId,
	statType,
	interval,
	aggregation,
	error,
} );
