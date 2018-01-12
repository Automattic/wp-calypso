/** @format */

/**
 * Internal dependencies
 */
import { HAPPYCHAT_IO_RECEIVE_INIT, HAPPYCHAT_ELIGIBILITY_SET } from 'state/action-types';
import { combineReducers, createReducer } from 'state/utils';
import { geoLocationSchema, isEligibleSchema } from './schema';

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
		[ HAPPYCHAT_IO_RECEIVE_INIT ]: ( state, action ) => {
			const { user: { geoLocation: location } } = action;
			if ( location && location.country_long && location.city ) {
				return location;
			}
			return state;
		},
	},
	geoLocationSchema
);

export const isEligible = createReducer(
	null,
	{
		[ HAPPYCHAT_ELIGIBILITY_SET ]: ( state, action ) => action.isEligible,
	},
	isEligibleSchema
);

export default combineReducers( { geoLocation, isEligible } );
