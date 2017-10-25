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
			const { user: { geoLocation: location } } = action;
			if ( location && location.country_long && location.city ) {
				return location;
			}
			return state;
		},
	},
	geoLocationSchema
);

export default combineReducers( { geoLocation } );
