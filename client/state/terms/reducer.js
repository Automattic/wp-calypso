/* eslint-disable no-case-declarations */
/**
 * External dependencies
 */
import { mapValues, merge } from 'lodash';

/**
 * Internal dependencies
 */
import {
	DESERIALIZE,
	TERM_REMOVE,
	TERMS_RECEIVE,
	TERMS_REQUEST,
	TERMS_REQUEST_FAILURE,
	TERMS_REQUEST_SUCCESS,
	SERIALIZE,
} from 'state/action-types';
import { combineReducers, withSchemaValidation } from 'state/utils';
import TermQueryManager from 'lib/query-manager/term';
import { getSerializedTermsQuery } from './utils';
import { queriesSchema } from './schema';

/**
 * Returns the updated terms query requesting state after an action has been
 * dispatched. The state reflects a mapping of serialized query to whether a
 * network request is in-progress for that query.
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
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
						[ serializedQuery ]: TERMS_REQUEST === action.type,
					},
				},
			} );
	}

	return state;
}

/**
 * Returns the updated term query state after an action has been dispatched.
 * The state reflects a mapping of serialized query key to an array of term IDs
 * for the query, if a query response was successfully received.
 */
export const queries = withSchemaValidation( queriesSchema, ( state = {}, action ) => {
	switch ( action.type ) {
		case TERMS_RECEIVE: {
			const { siteId, query, taxonomy, terms, found } = action;
			const hasManager = state[ siteId ] && state[ siteId ][ taxonomy ];
			const manager = hasManager ? state[ siteId ][ taxonomy ] : new TermQueryManager();
			const nextManager = manager.receive( terms, { query, found } );

			if ( hasManager && nextManager === state[ siteId ][ taxonomy ] ) {
				return state;
			}

			return {
				...state,
				[ siteId ]: {
					...state[ siteId ],
					[ taxonomy ]: nextManager,
				},
			};
		}
		case TERM_REMOVE: {
			const { siteId, taxonomy, termId } = action;
			if ( ! state[ siteId ] || ! state[ siteId ][ taxonomy ] ) {
				return state;
			}

			const nextManager = state[ siteId ][ taxonomy ].removeItem( termId );
			if ( nextManager === state[ siteId ][ taxonomy ] ) {
				return state;
			}

			return {
				...state,
				[ siteId ]: {
					...state[ siteId ],
					[ taxonomy ]: nextManager,
				},
			};
		}
		case SERIALIZE: {
			return mapValues( state, ( taxonomies ) => {
				return mapValues( taxonomies, ( { data, options } ) => {
					return { data, options };
				} );
			} );
		}
		case DESERIALIZE: {
			return mapValues( state, ( taxonomies ) => {
				return mapValues( taxonomies, ( { data, options } ) => {
					return new TermQueryManager( data, options );
				} );
			} );
		}
	}

	return state;
} );

export default combineReducers( {
	queries,
	queryRequests,
} );
