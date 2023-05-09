import {
	CURRENT_USER_RECEIVE,
	CURRENT_USER_SET_EMAIL_VERIFIED,
	CURRENT_USER_SET_JETPACK_PARTNER_TYPE,
	SITE_RECEIVE,
	SITES_RECEIVE,
} from 'calypso/state/action-types';
import { combineReducers, withSchemaValidation } from 'calypso/state/utils';
import emailVerification from './email-verification/reducer';
import { capabilitiesSchema, flagsSchema, idSchema, lasagnaSchema } from './schema';

/**
 * Tracks the current user ID.
 *
 * In development, if you are receiving Redux errors like this:
 *
 *     Error: Given action "CURRENT_USER_RECEIVE", reducer "id" returned undefined.
 *
 * This is likely caused by a server-side error or stored state corruption/auth token expiry.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @returns {Object}        Updated state
 */
export const id = withSchemaValidation( idSchema, ( state = null, action ) => {
	switch ( action.type ) {
		case CURRENT_USER_RECEIVE:
			return action.user.ID;
	}

	return state;
} );

export const user = ( state = null, action ) => {
	switch ( action.type ) {
		case CURRENT_USER_RECEIVE:
			return action.user;
		case CURRENT_USER_SET_EMAIL_VERIFIED:
			return {
				...state,
				email_verified: action.verified,
			};
		case CURRENT_USER_SET_JETPACK_PARTNER_TYPE:
			return {
				...state,
				jetpack_partner_types: [
					...( state.jetpack_partner_types || [] ),
					action.jetpack_partner_type,
				],
				has_jetpack_partner_access: true,
			};
	}

	return state;
};

export const flags = withSchemaValidation( flagsSchema, ( state = [], action ) => {
	switch ( action.type ) {
		case CURRENT_USER_RECEIVE:
			return action.user.meta?.data?.flags?.active_flags ?? [];
	}

	return state;
} );

/**
 * Compare if two sets of capabilities are equal.
 *
 * Capability sets are simple objects with boolean flags,
 * so comparison is as simple as comparing objects at the first level.
 *
 * @param  {Object} capA First set of capabilities
 * @param  {Object} capB Second set of capabilities
 * @returns {boolean} True if capability sets are the same, false otherwise.
 */
function areCapabilitiesEqual( capA, capB ) {
	if ( ! capA || ! capB ) {
		return false;
	}

	const keysA = Object.keys( capA );
	const keysB = Object.keys( capB );
	return keysA.length === keysB.length && keysA.every( ( key ) => capB[ key ] === capA[ key ] );
}

/**
 * Returns the updated capabilities state after an action has been dispatched.
 * The state maps site ID keys to an object of current user capabilities for
 * that site.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @returns {Object}        Updated state
 */
export const capabilities = withSchemaValidation( capabilitiesSchema, ( state = {}, action ) => {
	switch ( action.type ) {
		case SITE_RECEIVE:
		case SITES_RECEIVE: {
			const sites = action.site ? [ action.site ] : action.sites;
			return sites.reduce( ( memo, site ) => {
				if ( ! site.capabilities || areCapabilitiesEqual( site.capabilities, memo[ site.ID ] ) ) {
					return memo;
				}

				if ( memo === state ) {
					memo = { ...state };
				}

				memo[ site.ID ] = site.capabilities;
				return memo;
			}, state );
		}
	}

	return state;
} );

export const lasagnaJwt = withSchemaValidation( lasagnaSchema, ( state = null, action ) => {
	switch ( action.type ) {
		case CURRENT_USER_RECEIVE:
			return action.user.lasagna_jwt || null;
	}

	return state;
} );

export default combineReducers( {
	id,
	user,
	capabilities,
	flags,
	emailVerification,
	lasagnaJwt,
} );
