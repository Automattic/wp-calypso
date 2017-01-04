/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import { omit } from 'lodash';

/**
 * Internal dependencies
 */
import {
	MEDIA_DELETE,
	MEDIA_RECEIVE,
	MEDIA_REQUESTING } from 'state/action-types';
import { createReducer } from 'state/utils';
import MediaQueryManager from 'lib/query-manager/media';

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
		},
		[ MEDIA_DELETE ]: ( state, { siteId, mediaIds } ) => {
			return applyToManager( state, siteId, 'removeItems', true, mediaIds );
		}
	} );
} )();

export const queryRequests = createReducer( {}, {
	[ MEDIA_REQUESTING ]: ( state, { siteId, query } ) => {
		return {
			...state,
			[ siteId ]: {
				...state[ siteId ],
				[ MediaQueryManager.QueryKey.stringify( query ) ]: true
			}
		};
	},
	[ MEDIA_RECEIVE ]: ( state, { siteId, query } ) => {
		return {
			...state,
			[ siteId ]: omit( state[ siteId ], MediaQueryManager.QueryKey.stringify( query ) )
		};
	}
} );

export default combineReducers( {
	queries,
	queryRequests
} );
