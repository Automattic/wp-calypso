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
	MEDIA_ITEM_REQUEST_FAILURE,
	MEDIA_ITEM_REQUEST_SUCCESS,
	MEDIA_ITEM_REQUESTING,
	MEDIA_RECEIVE,
	MEDIA_REQUEST_FAILURE,
	MEDIA_REQUEST_SUCCESS,
	MEDIA_REQUESTING
} from 'state/action-types';
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
	[ MEDIA_REQUEST_SUCCESS ]: ( state, { siteId, query } ) => {
		return {
			...state,
			[ siteId ]: omit( state[ siteId ], MediaQueryManager.QueryKey.stringify( query ) )
		};
	},
	[ MEDIA_REQUEST_FAILURE ]: ( state, { siteId, query } ) => {
		return {
			...state,
			[ siteId ]: omit( state[ siteId ], MediaQueryManager.QueryKey.stringify( query ) )
		};
	}
} );

/**
 * Returns the updated site post requests state after an action has been
 * dispatched. The state reflects a mapping of site ID, post ID pairing to a
 * boolean reflecting whether a request for the post is in progress.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export const mediaItemRequests = createReducer( {}, {
	[ MEDIA_ITEM_REQUESTING ]: ( state, { siteId, mediaId } ) => {
		return {
			...state,
			[ siteId ]: {
				...state[ siteId ],
				[ mediaId ]: true
			}
		};
	},
	[ MEDIA_ITEM_REQUEST_SUCCESS ]: ( state, { siteId, mediaId } ) => {
		return {
			...state,
			[ siteId ]: omit( state[ siteId ], mediaId )
		};
	},
	[ MEDIA_ITEM_REQUEST_FAILURE ]: ( state, { siteId, mediaId } ) => {
		return {
			...state,
			[ siteId ]: omit( state[ siteId ], mediaId )
		};
	}
} );

export default combineReducers( {
	queries,
	queryRequests,
	mediaItemRequests
} );
