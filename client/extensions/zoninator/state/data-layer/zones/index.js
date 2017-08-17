/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { requestError, updateZones } from '../../zones/actions';
import { ZONINATOR_REQUEST_ZONES } from 'zoninator/state/action-types';

export const requestZonesList = ( { dispatch }, action ) => {
	const { siteId } = action;

	dispatch( http( {
		method: 'GET',
		path: `/jetpack-blogs/${ siteId }/rest-api/`,
		query: {
			path: '/zoninator/v1/zones',
		},
	}, action ) );
};

export const requestZonesError = ( { dispatch }, { siteId } ) =>
	dispatch( requestError( siteId ) );

export const updateZonesList = ( { dispatch }, { siteId }, { data } ) =>
	dispatch( updateZones( siteId, data ) );

const dispatchFetchZonesRequest = dispatchRequest( requestZonesList, updateZonesList, requestZonesError );

export default {
	[ ZONINATOR_REQUEST_ZONES ]: [ dispatchFetchZonesRequest ],
};
