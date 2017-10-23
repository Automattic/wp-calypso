/** @format */
/**
 * Internal dependencies
 */
import { HAPPYCHAT_CONNECTED } from 'state/action-types';
import { combineReducers, createReducer } from 'state/utils';
import { geoLocationSchema } from './schema';

/**
 * Tracks the current user geo location.
 *
 *
 * @format
 * @param {Object} action Action payload
 * @return {Object}        Updated state
 */
export const geoLocation = createReducer(
	null,
	{
		[ HAPPYCHAT_CONNECTED ]: ( state, action ) => {
			const { user: { geo_location } } = action;
			if ( geo_location && geo_location.country_long && geo_location.city ) {
				return geo_location;
			}
			return state;
		},
	},
	geoLocationSchema
);

export default combineReducers( { geoLocation } );
