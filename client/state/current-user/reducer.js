/**
 * External dependencies
 */
import { get, isEqual, reduce } from 'lodash';

/**
 * Internal dependencies
 */
import {
	CURRENT_USER_ID_SET,
	CURRENT_USER_FLAGS_RECEIVE,
	SITE_RECEIVE,
	SITE_PLANS_FETCH_COMPLETED,
	SITES_RECEIVE,
	SITES_UPDATE,
	PLANS_RECEIVE,
	USER_REQUEST_SUCCESS,
} from 'state/action-types';
import { combineReducers, createReducer } from 'state/utils';
import { idSchema, capabilitiesSchema, currencyCodeSchema, flagsSchema } from './schema';
import gravatarStatus from './gravatar-status/reducer';
import emailVerification from './email-verification/reducer';

/**
 * Tracks the current user ID.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export const id = createReducer( null, {
	[ CURRENT_USER_ID_SET ]: ( state, action ) => action.userId,
	[ USER_REQUEST_SUCCESS ]: ( state, action ) => action.user.ID,
}, idSchema );

export const flags = createReducer( [], {
	[ CURRENT_USER_FLAGS_RECEIVE ]: ( state, action ) => action.flags,
	[ USER_REQUEST_SUCCESS ]: ( state, action ) => action.user.meta.data.flags.active_flags,
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
	}

	return state;
}
capabilities.schema = capabilitiesSchema;

export default combineReducers( {
	id,
	currencyCode,
	capabilities,
	flags,
	gravatarStatus,
	emailVerification,
} );
