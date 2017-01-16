/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import { keyBy, omit } from 'lodash';

/**
 * Internal dependencies
 */
import {
	MEDIA_DELETE,
	MEDIA_RECEIVE,
	MEDIA_ITEMS_RECEIVE,
	MEDIA_ITEMS_REQUESTING,
	MEDIA_ITEMS_SELECTED_SET
} from 'state/action-types';
import { createReducer, keyedReducer } from 'state/utils';
import MediaQueryManager from 'lib/query-manager/media';

export const items = createReducer( {}, {
	[ MEDIA_RECEIVE ]: ( state, action ) => {
		const { siteId, media } = action;

		return {
			...state,
			[ siteId ]: {
				...state[ siteId ],
				...keyBy( media, 'ID' )
			}
		};
	},
	[ MEDIA_DELETE ]: ( state, action ) => {
		const { siteId, mediaIds } = action;

		if ( ! state[ siteId ] ) {
			return state;
		}

		return {
			...state,
			[ siteId ]: omit( state[ siteId ], mediaIds )
		};
	}
} );

export function queryRequests( state = {}, { type, siteId, query } ) {
	switch ( type ) {
		case MEDIA_ITEMS_REQUESTING:
		case MEDIA_ITEMS_RECEIVE:
			return {
				...state,
				[ siteId + ':' + MediaQueryManager.QueryKey.stringify( query ) ]: MEDIA_ITEMS_REQUESTING === type
			};
	}

	return state;
}

export const queries = ( () => {
	function applyToManager( state, siteId, method, createDefault, ...args ) {
		if ( ! state[ siteId ] ) {
			if ( ! createDefault ) {
				return state;
			}

			return {
				...state,
				[ siteId ]: ( new MediaQueryManager() )[ method ]( ...args )
			};
		}

		const nextManager = state[ siteId ][ method ]( ...args );

		if ( nextManager === state[ siteId ] ) {
			return state;
		}

		return {
			...state,
			[ siteId ]: nextManager
		};
	}

	return createReducer( {}, {
		[ MEDIA_ITEMS_RECEIVE ]: ( state, { siteId, query, items, found } ) => {
			return applyToManager( state, siteId, 'receive', true, items, { query, found } );
		}
	} );
} )();

export const selected = keyedReducer( 'siteId', createReducer( [], {
	[ MEDIA_ITEMS_SELECTED_SET ]: ( state, { ids } ) => {
		return [ ...ids ];
	}
} ) );

export default combineReducers( {
	items,
	queries,
	queryRequests,
	selected
} );
