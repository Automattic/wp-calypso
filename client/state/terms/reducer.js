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
	TERMS_ADD_REQUEST,
	TERMS_ADD_REQUEST_SUCCESS,
	TERMS_ADD_REQUEST_FAILURE,
	TERMS_RECEIVE,
	TERMS_REQUEST,
	TERMS_REQUEST_FAILURE,
	TERMS_REQUEST_SUCCESS,
	SERIALIZE
} from 'state/action-types';
import { isValidStateWithSchema } from 'state/utils';
import { DEFAULT_TERMS_QUERY } from './constants';

import {
	getSerializedTermsQuery,
	getSerializedTermsQueryWithoutPage
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
			const serializedQuery = getSerializedTermsQuery( action.query );
			return merge( {}, state, {
				[ action.siteId ]: {
					[ action.taxonomy ]: {
						[ serializedQuery ]: TERMS_REQUEST === action.type
					}
				}
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
		case TERMS_RECEIVE:
			if ( ! action.query ) {
				return state;
			}

			const serializedQuery = getSerializedTermsQuery( action.query );
			return merge( {}, state, {
				[ action.siteId ]: {
					[ action.taxonomy ]: {
						[ serializedQuery ]: action.terms.map( ( term ) => term.ID )
					}
				}
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
 * Returns the updated terms query last page state after an action has been
 * dispatched. The state reflects a mapping of serialized query to last known
 * page number.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function queriesLastPage( state = {}, action ) {
	switch ( action.type ) {
		case TERMS_REQUEST_SUCCESS:
			const { siteId, found, taxonomy, query } = action;
			const serializedQuery = getSerializedTermsQueryWithoutPage( query );
			const lastPage = Math.ceil( found / ( query.number || DEFAULT_TERMS_QUERY.number ) );

			return merge( {}, state, {
				[ siteId ]: {
					[ taxonomy ]: {
						[ serializedQuery ]: Math.max( lastPage, 1 )
					}
				}
			} );

		case SERIALIZE:
		case DESERIALIZE:
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

		case TERMS_ADD_REQUEST:
			return merge( {}, state, {
				[ action.siteId ]: {
					[ action.taxonomy ]: {
						[ action.temporaryId ]: action.term
					}
				}
			} );

		case TERMS_ADD_REQUEST_SUCCESS:
			const taxonomyTerms = merge( {}, state );
			taxonomyTerms[ action.siteId ][ action.taxonomy ][ action.term.ID ] = action.term;
			delete taxonomyTerms[ action.siteId ][ action.taxonomy ][ action.temporaryId ];

			return taxonomyTerms;

		case TERMS_ADD_REQUEST_FAILURE:
			const terms = merge( {}, state );
			delete terms[ action.siteId ][ action.taxonomy ][ action.temporaryId ];

			return terms;

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
	queries,
	queriesLastPage,
	queryRequests
} );
