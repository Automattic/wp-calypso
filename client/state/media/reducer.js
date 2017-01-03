/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import { keyBy, omit, without } from 'lodash';

/**
 * Internal dependencies
 */
import {
	MEDIA_DELETE,
	MEDIA_RECEIVE,
	MEDIA_REQUESTING } from 'state/action-types';
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
		[ MEDIA_RECEIVE ]: ( state, { siteId, media, found, query } ) => {
			return applyToManager( state, siteId, 'receive', true, media, { found, query } );
		}
	} );
} )();

export const queryRequests = keyedReducer( 'siteId', createReducer( [], {
	[ MEDIA_REQUESTING ]: ( state, { query } ) => {
		return [
			...state,
			MediaQueryManager.QueryKey.stringify( query )
		];
	},
	[ MEDIA_RECEIVE ]: ( state, { query } ) => {
		return without( state, MediaQueryManager.QueryKey.stringify( query ) );
	}
} ) );

export default combineReducers( {
	items,
	queries,
	queryRequests
} );
