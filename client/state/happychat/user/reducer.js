/**
 * Internal dependencies
 */
import {
	HAPPYCHAT_IO_RECEIVE_INIT,
	HAPPYCHAT_ELIGIBILITY_SET,
	PRESALE_PRECANCELLATION_CHAT_AVAILABILITY_SET,
} from 'calypso/state/action-types';
import { combineReducers, withSchemaValidation } from 'calypso/state/utils';
import {
	geoLocationSchema,
	isEligibleSchema,
	isPresalesPrecancellationEligible as isPresalesPrecancellationEligibleSchema,
} from './schema';

/**
 * Tracks the current user geo location.
 *
 *
 * @param {object} action Action payload
 * @returns {object}        Updated state
 */
export const geoLocation = withSchemaValidation( geoLocationSchema, ( state = null, action ) => {
	switch ( action.type ) {
		case HAPPYCHAT_IO_RECEIVE_INIT: {
			const {
				user: { geoLocation: location },
			} = action;
			if ( location && location.country_long && location.city ) {
				return location;
			}
			return state;
		}
	}

	return state;
} );

export const isEligible = withSchemaValidation( isEligibleSchema, ( state = null, action ) => {
	switch ( action.type ) {
		case HAPPYCHAT_ELIGIBILITY_SET:
			return action.isEligible;
	}

	return state;
} );

export const isPresalesPrecancellationEligible = withSchemaValidation(
	isPresalesPrecancellationEligibleSchema,
	( state = null, action ) => {
		switch ( action.type ) {
			case PRESALE_PRECANCELLATION_CHAT_AVAILABILITY_SET:
				return action.availability;
		}

		return state;
	}
);

export default combineReducers( { geoLocation, isEligible, isPresalesPrecancellationEligible } );
