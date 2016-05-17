/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import {
	CURRENT_USER_ID_SET,
	SITE_RECEIVE,
	SITES_RECEIVE,
	SERIALIZE,
	DESERIALIZE
} from 'state/action-types';
import { isValidStateWithSchema } from 'state/utils';
import { idSchema, capabilitiesSchema } from './schema';

/**
 * Tracks the current user ID.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function id( state = null, action ) {
	switch ( action.type ) {
		case CURRENT_USER_ID_SET:
			state = action.userId;
			break;
		case SERIALIZE:
			return state;
		case DESERIALIZE:
			if ( isValidStateWithSchema( state, idSchema ) ) {
				return state;
			}
			return null;
	}

	return state;
}

/**
 * Returns the updated capabilities state after an action has been dispatched.
 * The state maps site ID keys to an object of current user capabilities for
 * that site.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function capabilities( state = {}, action ) {
	switch ( action.type ) {
		case SITE_RECEIVE:
			if ( ! action.site.capabilities ) {
				return state;
			}

			return Object.assign( {}, state, {
				[ action.site.ID ]: action.site.capabilities
			} );

		case SITES_RECEIVE:
			const siteCapabilities = action.sites.reduce( ( memo, site ) => {
				if ( site.capabilities ) {
					memo[ site.ID ] = site.capabilities;
				}

				return memo;
			}, {} );

			return Object.assign( {}, state, siteCapabilities );

		case DESERIALIZE:
			if ( isValidStateWithSchema( state, capabilitiesSchema ) ) {
				return state;
			}

			return {};
	}

	return state;
}

export default combineReducers( {
	id,
	capabilities
} );
