import { HAPPYCHAT_IO_RECEIVE_INIT, HAPPYCHAT_SET_USER_CONFIG } from 'calypso/state/action-types';
import { combineReducers, withSchemaValidation } from 'calypso/state/utils';
import {
	geoLocationSchema,
	isEligibleSchema,
	availabilitySchema,
	supportLevelSchema,
} from './schema';

/**
 * Tracks the current user geo location.
 *
 *
 * @param {Object} action Action payload
 * @returns {Object}        Updated state
 */
export const geoLocation = withSchemaValidation( geoLocationSchema, ( state = null, action ) => {
	switch ( action.type ) {
		case HAPPYCHAT_IO_RECEIVE_INIT: {
			const location = action.user.geoLocation;
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
		case HAPPYCHAT_SET_USER_CONFIG:
			return action.config.isUserEligible;
	}

	return state;
} );

export const availability = withSchemaValidation( availabilitySchema, ( state = null, action ) => {
	switch ( action.type ) {
		case HAPPYCHAT_SET_USER_CONFIG:
			return action.config.availability;
	}

	return state;
} );

/**
 * The level of support we're offering to this user (represents their highest paid plan).
 */
export const supportLevel = withSchemaValidation( supportLevelSchema, ( state = null, action ) => {
	switch ( action.type ) {
		case HAPPYCHAT_SET_USER_CONFIG:
			return action.config.supportLevel;
		default:
			return state;
	}
} );

export default combineReducers( {
	geoLocation,
	isEligible,
	availability,
	supportLevel,
} );
