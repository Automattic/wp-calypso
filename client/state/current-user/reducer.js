/**
 * External dependencies
 */
import { get, isEqual, reduce, keys, first } from 'lodash';

/**
 * Internal dependencies
 */
import {
	CURRENT_USER_RECEIVE,
	SITE_RECEIVE,
	SITE_PLANS_FETCH_COMPLETED,
	SITES_RECEIVE,
	PLANS_RECEIVE,
	PRODUCTS_LIST_RECEIVE,
} from 'state/action-types';
import { combineReducers, withSchemaValidation } from 'state/utils';
import {
	capabilitiesSchema,
	currencyCodeSchema,
	flagsSchema,
	idSchema,
	lasagnaSchema,
} from './schema';
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

export const flags = withSchemaValidation( flagsSchema, ( state = [], action ) => {
	switch ( action.type ) {
		case CURRENT_USER_RECEIVE:
			return get( action.user, 'meta.data.flags.active_flags', [] );
	}

	return state;
} );

/**
 * Tracks the currency code of the current user
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
 *
 */
export const currencyCode = withSchemaValidation( currencyCodeSchema, ( state = null, action ) => {
	switch ( action.type ) {
		case PRODUCTS_LIST_RECEIVE: {
			return get(
				action.productsList,
				[ first( keys( action.productsList ) ), 'currency_code' ],
				state
			);
		}
		case PLANS_RECEIVE: {
			return get( action.plans, [ 0, 'currency_code' ], state );
		}
		case SITE_PLANS_FETCH_COMPLETED: {
			return get( action.plans, [ 0, 'currencyCode' ], state );
		}
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
	currencyCode,
	capabilities,
	flags,
	gravatarStatus,
	emailVerification,
	lasagnaJwt,
} );
