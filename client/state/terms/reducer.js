/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import merge from 'lodash/merge';
import keyBy from 'lodash/keyBy';

/**
 * Internal dependencies
 */
import {
	DESERIALIZE,
	TERMS_RECEIVE,
	TERMS_REQUEST,
	TERMS_REQUEST_FAILURE,
	TERMS_REQUEST_SUCCESS,
	SERIALIZE
} from 'state/action-types';
import { isValidStateWithSchema } from 'state/utils';

import {
	getSerializedTaxonomyTermsQuery
} from './utils';

import {
	termsSchema,
	queriesSchema
} from './schema';

/**
 * Returns the updated terms query requesting state after an action has been
 * dispatched. The state reflects a mapping of serialized query to whether a
 * network request is in-progress for that query.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function queryRequests( state = {}, action ) {
	switch ( action.type ) {
		case TERMS_REQUEST:
		case TERMS_REQUEST_SUCCESS:
		case TERMS_REQUEST_FAILURE:
			const serializedQuery = getSerializedTaxonomyTermsQuery( action.query, action.taxonomy, action.siteId );
			return Object.assign( {}, state, {
				[ serializedQuery ]: TERMS_REQUEST === action.type
			} );

		case SERIALIZE:
		case DESERIALIZE:
			return {};
	}

	return state;
}

/**
 * Returns the updated term query state after an action has been dispatched.
 * The state reflects a mapping of serialized query key to an array of term IDs
 * for the query, if a query response was successfully received.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function queries( state = {}, action ) {
	switch ( action.type ) {
		case TERMS_REQUEST_SUCCESS:
			const serializedQuery = getSerializedTaxonomyTermsQuery( action.query, action.taxonomy, action.siteId );
			return Object.assign( {}, state, {
				[ serializedQuery ]: action.terms.map( ( term ) => term.ID )
			} );

		case DESERIALIZE:
			if ( isValidStateWithSchema( state, queriesSchema ) ) {
				return state;
			}

			return {};
	}

	return state;
}

/**
 * Returns the updated terms state after an action has been dispatched.
 * The state reflects a mapping of site ID to terms
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function items( state = {}, action ) {
	switch ( action.type ) {
		case TERMS_RECEIVE:
			return merge( {}, state, {
				[ action.siteId ]: {
					[ action.taxonomy ]: keyBy( action.terms, 'ID' )
				}
			} );

		case DESERIALIZE:
			if ( isValidStateWithSchema( state, termsSchema ) ) {
				return state;
			}

			return {};
	}

	return state;
}

export default combineReducers( {
	items,
	queryRequests,
	queries
} );
