/** @format */

/**
 * Internal dependencies
 */
import {
	GOOGLE_MY_BUSINESS_CONNECT_LOCATION,
	GOOGLE_MY_BUSINESS_DISCONNECT_LOCATION,
	GOOGLE_MY_BUSINESS_STATS_CHANGE_INTERVAL,
	GOOGLE_MY_BUSINESS_STATS_SEARCH_REQUEST,
	GOOGLE_MY_BUSINESS_STATS_SEARCH_SET_DATA,
	GOOGLE_MY_BUSINESS_STATS_REQUEST,
	GOOGLE_MY_BUSINESS_STATS_SET_DATA,
} from 'state/action-types';
import { saveSiteSettings } from 'state/site-settings/actions';

export const connectGoogleMyBusinessLocation = (
	siteId,
	keyringConnectionId,
	locationId
) => dispatch => {
	dispatch( {
		type: GOOGLE_MY_BUSINESS_CONNECT_LOCATION,
		siteId,
		keyringConnectionId,
		locationId,
	} );

	return dispatch(
		saveSiteSettings( siteId, {
			google_my_business_keyring_id: keyringConnectionId,
			google_my_business_location_id: locationId,
		} )
	).then( ( { updated } ) => {
		if (
			! updated.hasOwnProperty( 'google_my_business_keyring_id' ) &&
			! updated.hasOwnProperty( 'google_my_business_location_id' )
		) {
			return Promise.reject();
		}
		return Promise.resolve();
	} );
};

export const disconnectGoogleMyBusinessLocation = siteId => dispatch => {
	dispatch( {
		type: GOOGLE_MY_BUSINESS_DISCONNECT_LOCATION,
		siteId,
	} );

	return dispatch(
		saveSiteSettings( siteId, {
			google_my_business_keyring_id: false,
			google_my_business_location_id: false,
		} )
	).then( ( { updated } ) => {
		if (
			! updated.hasOwnProperty( 'google_my_business_keyring_id' ) &&
			! updated.hasOwnProperty( 'google_my_business_location_id' )
		) {
			return Promise.reject();
		}
		return Promise.resolve();
	} );
};

export const changeGoogleMyBusinessStatsInterval = ( siteId, statType, interval ) => ( {
	type: GOOGLE_MY_BUSINESS_STATS_CHANGE_INTERVAL,
	siteId,
	statType,
	interval,
} );

export const requestGoogleMyBusinessStats = (
	siteId,
	timeSpan = 'week',
	statName = 'search'
) => ( {
	type: GOOGLE_MY_BUSINESS_STATS_REQUEST,
	timeSpan,
	statName,
} );

export const receiveGoogleMyBusinessStats = data => ( {
	type: GOOGLE_MY_BUSINESS_STATS_SET_DATA,
	data,
} );
