/**
 * External dependencies
 */
import { get, isEqual, reduce } from 'lodash';

/**
 * Internal dependencies
 */
import { CURRENT_USER_RECEIVE, SITE_RECEIVE, SITES_RECEIVE } from 'calypso/state/action-types';
import { combineReducers, withSchemaValidation } from 'calypso/state/utils';
import { capabilitiesSchema, flagsSchema, idSchema, lasagnaSchema } from './schema';
import gravatarStatus from './gravatar-status/reducer';
import emailVerification from './email-verification/reducer';

/**
 * Tracks the current user ID.
 *
 * In development, if you are receiving Redux errors like this:
 *
 *     Error: Given action "CURRENT_USER_RECEIVE", reducer "id" returned undefined.
 *
 * This is likely caused by a server-side error or stored state corruption/auth token expiry.
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
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
	}

	return state;
};

export const flags = withSchemaValidation( flagsSchema, ( state = [], action ) => {
	switch ( action.type ) {
		case CURRENT_USER_RECEIVE:
			return get( action.user, 'meta.data.flags.active_flags', [] );
	}

	return state;
} );

/**
 * Returns the updated capabilities state after an action has been dispatched.
 * The state maps site ID keys to an object of current user capabilities for
 * that site.
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
 */
export const capabilities = withSchemaValidation( capabilitiesSchema, ( state = {}, action ) => {
	switch ( action.type ) {
		case SITE_RECEIVE:
		case SITES_RECEIVE: {
			const sites = action.site ? [ action.site ] : action.sites;
			return reduce(
				sites,
				( memo, site ) => {
					if ( ! site.capabilities || isEqual( site.capabilities, memo[ site.ID ] ) ) {
						return memo;
					}

					if ( memo === state ) {
						memo = { ...state };
					}

					memo[ site.ID ] = site.capabilities;
					return memo;
				},
				state
			);
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
	gravatarStatus,
	emailVerification,
	lasagnaJwt,
} );
