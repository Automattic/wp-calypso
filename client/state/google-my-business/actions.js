/** @format */

/**
 * Internal dependencies
 */
import {
	GOOGLE_MY_BUSINESS_STATS_RECEIVE,
	GOOGLE_MY_BUSINESS_STATS_REQUEST,
} from 'state/action-types';
import { saveSiteKeyrings, deleteSiteKeyring } from 'state/site-keyrings/actions';

export const connectGoogleMyBusinessLocation = (
	siteId,
	keyringConnectionId,
	locationId
) => dispatch =>
	dispatch(
		saveSiteKeyrings( siteId, {
			keyring_id: keyringConnectionId,
			external_user_id: locationId,
			service: 'google_my_business',
		} )
	);

export const disconnectGoogleMyBusinessLocation = ( siteId, keyringSiteId ) => dispatch =>
	dispatch( deleteSiteKeyring( siteId, keyringSiteId ) );

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
