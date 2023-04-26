/* eslint-disable no-case-declarations */

import { withStorageKey } from '@automattic/state-utils';
import { mapValues, merge } from 'lodash';
import TermQueryManager from 'calypso/lib/query-manager/term';
import {
	TERM_REMOVE,
	TERMS_RECEIVE,
	TERMS_REQUEST,
	TERMS_REQUEST_FAILURE,
	TERMS_REQUEST_SUCCESS,
} from 'calypso/state/action-types';
import { combineReducers, withSchemaValidation, withPersistence } from 'calypso/state/utils';
import { queriesSchema } from './schema';
import { getSerializedTermsQuery } from './utils';

/**
 * Returns the updated terms query requesting state after an action has been
 * dispatched. The state reflects a mapping of serialized query to whether a
 * network request is in-progress for that query.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @returns {Object}        Updated state
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

const queriesReducer = ( state = {}, action ) => {
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
	}

	return state;
};

export const queries = withSchemaValidation(
	queriesSchema,
	withPersistence( queriesReducer, {
		serialize: ( state ) =>
			mapValues( state, ( taxonomies ) =>
				mapValues( taxonomies, ( { data, options } ) => ( { data, options } ) )
			),
		deserialize: ( persisted ) =>
			mapValues( persisted, ( taxonomies ) =>
				mapValues( taxonomies, ( { data, options } ) => new TermQueryManager( data, options ) )
			),
	} )
);

const combinedReducer = combineReducers( {
	queries,
	queryRequests,
} );

const termsReducer = withStorageKey( 'terms', combinedReducer );
export default termsReducer;
