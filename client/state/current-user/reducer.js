/**
 * External dependencies
 */
import { isEqual, reduce } from 'lodash';

/**
 * Internal dependencies
 */
import {
	CURRENT_USER_RECEIVE,
	CURRENT_USER_SET_EMAIL_VERIFIED,
	SITE_RECEIVE,
	SITES_RECEIVE,
} from 'calypso/state/action-types';
import { combineReducers, withSchemaValidation } from 'calypso/state/utils';
import { capabilitiesSchema } from './schema';
import gravatarStatus from './gravatar-status/reducer';
import emailVerification from './email-verification/reducer';

export const user = ( state = null, action ) => {
	switch ( action.type ) {
		case CURRENT_USER_RECEIVE:
			return action.user;
		case CURRENT_USER_SET_EMAIL_VERIFIED:
			return {
				...state,
				email_verified: action.verified,
			};
	}

	return state;
};

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

export default combineReducers( {
	user,
	capabilities,
	gravatarStatus,
	emailVerification,
} );
