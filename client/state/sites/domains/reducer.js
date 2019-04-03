/** @format */
/**
 * External dependencies
 */
import { find, indexOf } from 'lodash';

/**
 * Internal dependencies
 */
import {
	DOMAIN_PRIVACY_TOGGLE,
	SITE_DOMAINS_RECEIVE,
	SITE_DOMAINS_REQUEST,
	SITE_DOMAINS_REQUEST_SUCCESS,
	SITE_DOMAINS_REQUEST_FAILURE,
} from 'state/action-types';
import { combineReducers } from 'state/utils';
import { itemsSchema } from './schema';

/**
 * Domains `Reducer` function
 *
 * @param {Object} state - current state
 * @param {Object} action - domains action
 * @return {Object} updated state
 */
export const items = ( state = {}, action ) => {
	const { siteId } = action;
	switch ( action.type ) {
		case SITE_DOMAINS_RECEIVE:
			return Object.assign( {}, state, {
				[ siteId ]: action.domains,
			} );
		case DOMAIN_PRIVACY_TOGGLE:
			// Find the domain we want to update
			const targetDomain = find( state[ siteId ], { domain: action.domain } );
			const domainIndex = indexOf( state[ siteId ], targetDomain );
			// Copy as we shouldn't mutate original state
			const newDomains = [ ...state[ siteId ] ];
			// Update privacy
			newDomains.splice(
				domainIndex,
				1,
				Object.assign( {}, targetDomain, {
					privateDomain: ! targetDomain.privateDomain,
				} )
			);

			return Object.assign( {}, state, {
				[ siteId ]: newDomains,
			} );
	}

	return state;
};
items.schema = itemsSchema;

/**
 * `Reducer` function which handles request/response actions
 * to/from WP REST-API
 *
 * @param {Object} state - current state
 * @param {Object} action - domains action
 * @return {Object} updated state
 */
export const requesting = ( state = {}, action ) => {
	switch ( action.type ) {
		case SITE_DOMAINS_REQUEST:
		case SITE_DOMAINS_REQUEST_SUCCESS:
		case SITE_DOMAINS_REQUEST_FAILURE:
			return Object.assign( {}, state, {
				[ action.siteId ]: action.type === SITE_DOMAINS_REQUEST,
			} );
	}

	return state;
};

/**
 * `Reducer` function which handles ERRORs REST-API response actions
 *
 * @param {Object} state - current state
 * @param {Object} action - domains action
 * @return {Object} updated state
 */
export const errors = ( state = {}, action ) => {
	switch ( action.type ) {
		case SITE_DOMAINS_REQUEST:
		case SITE_DOMAINS_REQUEST_SUCCESS:
			return Object.assign( {}, state, {
				[ action.siteId ]: null,
			} );

		case SITE_DOMAINS_REQUEST_FAILURE:
			return Object.assign( {}, state, {
				[ action.siteId ]: action.error,
			} );
	}

	return state;
};

export default combineReducers( {
	errors,
	items,
	requesting,
} );
