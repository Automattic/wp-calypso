/** @format */

/**
 * External dependencies
 */

import { get, isEqual, reduce } from 'lodash';

/**
 * Internal dependencies
 */
import {
	CURRENT_USER_RECEIVE,
	SITE_RECEIVE,
	SITE_PLANS_FETCH_COMPLETED,
	SITES_RECEIVE,
	PLANS_RECEIVE,
} from 'state/action-types';
import { combineReducers, createReducer } from 'state/utils';
import { idSchema, capabilitiesSchema, currencyCodeSchema, flagsSchema } from './schema';
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
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export const id = createReducer(
	null,
	{
		[ CURRENT_USER_RECEIVE ]: ( state, action ) => action.user.ID,
	},
	idSchema
);

export const flags = createReducer(
	[],
	{
		[ CURRENT_USER_RECEIVE ]: ( state, action ) =>
			get( action.user, 'meta.data.flags.active_flags', [] ),
	},
	flagsSchema
);

/**
 * Tracks the currency code of the current user
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 *
 */
export const currencyCode = createReducer(
	null,
	{
		[ PLANS_RECEIVE ]: ( state, action ) => {
			return get( action.plans[ 0 ], 'currency_code', state );
		},
		[ SITE_PLANS_FETCH_COMPLETED ]: ( state, action ) => {
			return get( action.plans[ 0 ], 'currencyCode', state );
		},
	},
	currencyCodeSchema
);

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
