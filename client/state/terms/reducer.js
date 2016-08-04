/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import mapValues from 'lodash/mapValues';
import merge from 'lodash/merge';

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
	SERIALIZE
} from 'state/action-types';
import TermQueryManager from 'lib/query-manager/term';
import { isValidStateWithSchema, createReducer } from 'state/utils';
import { getSerializedTermsQuery } from './utils';
import { queriesSchema } from './schema';

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
 */
export const queries = createReducer( {}, {
	[ TERMS_RECEIVE ]: ( state, action ) => {
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
				[ taxonomy ]: nextManager
			}
		};
	},
	[ TERM_REMOVE ]: ( state, action ) => {
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
				[ taxonomy ]: nextManager
			}
		};
	},
	[ SERIALIZE ]: ( state ) => {
		return mapValues( state, ( taxonomies ) => {
			return mapValues( taxonomies, ( { data, options } ) => {
				return { data, options };
			} );
		} );
	},
	[ DESERIALIZE ]: ( state ) => {
		if ( ! isValidStateWithSchema( state, queriesSchema ) ) {
			return {};
		}

		return mapValues( state, ( taxonomies ) => {
			return mapValues( taxonomies, ( { data, options } ) => {
				return new TermQueryManager( data, options );
			} );
		} );
	}
} );

export default combineReducers( {
	queries,
	queryRequests
} );
