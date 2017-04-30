/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import { get, isEqual, reduce } from 'lodash';

/**
 * Internal dependencies
 */
import {
	CURRENT_USER_ID_SET,
	CURRENT_USER_FLAGS_RECEIVE,
	DESERIALIZE,
	SITE_RECEIVE,
	SITE_PLANS_FETCH_COMPLETED,
	SITES_RECEIVE,
	SITES_UPDATE,
	PLANS_RECEIVE
} from 'state/action-types';
import { createReducer, isValidStateWithSchema } from 'state/utils';
import { idSchema, capabilitiesSchema, currencyCodeSchema, flagsSchema } from './schema';
import gravatarStatus from './gravatar-status/reducer';

/**
 * Tracks the current user ID.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export const id = createReducer( null, {
	[ CURRENT_USER_ID_SET ]: ( state, action ) => action.userId
}, idSchema );

export const flags = createReducer( [], {
	[ CURRENT_USER_FLAGS_RECEIVE ]: ( state, action ) => action.flags
}, flagsSchema );

/**
 * Tracks the currency code of the current user
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 *
 */
export const currencyCode = createReducer( null, {
	[ PLANS_RECEIVE ]: ( state, action ) => {
		return get( action.plans[ 0 ], 'currency_code', state );
	},
	[ SITE_PLANS_FETCH_COMPLETED ]: ( state, action ) => {
		return get( action.plans[ 0 ], 'currencyCode', state );
	}
}, currencyCodeSchema );

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
		case SITES_RECEIVE:
		case SITES_UPDATE:
			const sites = action.site ? [ action.site ] : action.sites;
			return reduce( sites, ( memo, site ) => {
				if ( SITES_UPDATE === action.type && ! memo[ site.ID ] ) {
					return memo;
				}

				if ( ! site.capabilities || isEqual( site.capabilities, memo[ site.ID ] ) ) {
					return memo;
				}

				if ( memo === state ) {
					memo = { ...state };
				}

				memo[ site.ID ] = site.capabilities;
				return memo;
			}, state );

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
	currencyCode,
	capabilities,
	flags,
	gravatarStatus
} );
