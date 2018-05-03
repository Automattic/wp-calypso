/** @format */

/**
 * Internal dependencies
 */
import {
	GOOGLE_MY_BUSINESS_STATS_RECEIVE,
	GOOGLE_MY_BUSINESS_STATS_REQUEST,
} from 'state/action-types';
import { saveSiteSettings } from 'state/site-settings/actions';

export const connectGoogleMyBusinessLocation = (
	siteId,
	keyringConnectionId,
	locationId
) => dispatch => {
	return dispatch(
		saveSiteSettings( siteId, {
			jetpack_google_my_business_keyring_id: keyringConnectionId,
			jetpack_google_my_business_location_id: locationId,
		} )
	).then( ( { updated } ) => {
		if (
			! updated.hasOwnProperty( 'jetpack_google_my_business_keyring_id' ) &&
			! updated.hasOwnProperty( 'jetpack_google_my_business_location_id' )
		) {
			return Promise.reject();
		}
		return Promise.resolve();
	} );
};

export const disconnectGoogleMyBusinessLocation = siteId => dispatch => {
	return dispatch(
		saveSiteSettings( siteId, {
			jetpack_google_my_business_keyring_id: false,
			jetpack_google_my_business_location_id: false,
		} )
	).then( ( { updated } ) => {
		if (
			! updated.hasOwnProperty( 'jetpack_google_my_business_keyring_id' ) &&
			! updated.hasOwnProperty( 'jetpack_google_my_business_location_id' )
		) {
			return Promise.reject();
		}
		return Promise.resolve();
	} );
};

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
