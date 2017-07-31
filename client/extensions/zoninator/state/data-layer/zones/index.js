/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { fetchError, updateZones } from '../../zones/actions';
import { ZONINATOR_FETCH_ZONES } from 'zoninator/state/action-types';

export const fetchZonesList = ( { dispatch }, action ) => {
	const { siteId } = action;

	dispatch( http( {
		method: 'GET',
		path: `/jetpack-blogs/${ siteId }/rest-api/`,
		query: {
			path: 'zoninator/v1/zones',
		},
	}, action ) );
};

export const fetchZonesError = ( { dispatch }, { siteId } ) =>
	dispatch( fetchError( siteId ) );

export const updateZonesList = ( { dispatch }, { siteId }, next, { data } ) =>
	dispatch( updateZones( siteId, data ) );

const dispatchFetchZonesRequest = dispatchRequest( fetchZonesList, updateZonesList, fetchZonesError );

export default {
	[ ZONINATOR_FETCH_ZONES ]: [ dispatchFetchZonesRequest ],
};
