/* eslint-disable no-case-declarations */
/**
 * Internal dependencies
 */
import {
	SITE_VOUCHERS_ASSIGN_RECEIVE,
	SITE_VOUCHERS_ASSIGN_REQUEST,
	SITE_VOUCHERS_ASSIGN_REQUEST_SUCCESS,
	SITE_VOUCHERS_ASSIGN_REQUEST_FAILURE,
	SITE_VOUCHERS_RECEIVE,
	SITE_VOUCHERS_REQUEST,
	SITE_VOUCHERS_REQUEST_SUCCESS,
	SITE_VOUCHERS_REQUEST_FAILURE,
} from 'calypso/state/action-types';
import { combineReducers, withSchemaValidation } from 'calypso/state/utils';
import { itemsSchema } from './schema';

/**
 * vouchers `Reducer` function
 *
 * @param {object} state - current state
 * @param {object} action - vouchers action
 * @returns {object} updated state
 */
export const items = withSchemaValidation( itemsSchema, ( state = {}, action ) => {
	const { siteId, type, voucher, vouchers, serviceType } = action;

	switch ( type ) {
		case SITE_VOUCHERS_ASSIGN_RECEIVE:
			const serviceVouchers = state[ siteId ] ? state[ siteId ][ serviceType ] || [] : [];

			return Object.assign( {}, state, {
				[ siteId ]: {
					[ serviceType ]: serviceVouchers.concat( voucher ),
				},
			} );

		case SITE_VOUCHERS_RECEIVE:
			return Object.assign( {}, state, {
				[ siteId ]: vouchers,
			} );
	}

	return state;
} );

/**
 * `Reducer` function which handles request/response actions
 * to/from WP REST-API
 *
 * @param {object} state - current state
 * @param {object} action - vouchers action
 * @returns {object} updated state
 */
export const requesting = ( state = {}, { type, siteId } ) => {
	switch ( type ) {
		case SITE_VOUCHERS_ASSIGN_REQUEST:
		case SITE_VOUCHERS_ASSIGN_REQUEST_SUCCESS:
		case SITE_VOUCHERS_ASSIGN_REQUEST_FAILURE:
		case SITE_VOUCHERS_REQUEST:
		case SITE_VOUCHERS_REQUEST_SUCCESS:
		case SITE_VOUCHERS_REQUEST_FAILURE:
			return Object.assign( {}, state, {
				[ siteId ]: {
					getAll: type === SITE_VOUCHERS_REQUEST,
					assign: type === SITE_VOUCHERS_ASSIGN_REQUEST,
				},
			} );
	}

	return state;
};

/**
 * `Reducer` function which handles ERRORs REST-API response actions
 *
 * @param {object} state - current state
 * @param {object} action - vouchers action
 * @returns {object} updated state
 */
export const errors = ( state = {}, { type, siteId, error } ) => {
	switch ( type ) {
		case SITE_VOUCHERS_ASSIGN_REQUEST:
		case SITE_VOUCHERS_ASSIGN_REQUEST_SUCCESS:
		case SITE_VOUCHERS_REQUEST:
		case SITE_VOUCHERS_REQUEST_SUCCESS:
			return Object.assign( {}, state, {
				[ siteId ]: {
					getAll: null,
					assign: null,
				},
			} );

		case SITE_VOUCHERS_REQUEST_FAILURE:
		case SITE_VOUCHERS_ASSIGN_REQUEST_FAILURE:
			return Object.assign( {}, state, {
				[ siteId ]: {
					getAll: type === SITE_VOUCHERS_REQUEST_FAILURE ? error : null,
					assign: type === SITE_VOUCHERS_ASSIGN_REQUEST_FAILURE ? error : null,
				},
			} );
	}

	return state;
};

export default combineReducers( {
	items,
	requesting,
	errors,
} );
