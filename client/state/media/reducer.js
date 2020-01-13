/**
 * External dependencies
 */

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
	MEDIA_REQUESTING,
} from 'state/action-types';
import { combineReducers, withoutPersistence } from 'state/utils';
import MediaQueryManager from 'lib/query-manager/media';

export const queries = ( () => {
	function applyToManager( state, siteId, method, createDefault, ...args ) {
		if ( ! state[ siteId ] ) {
			if ( ! createDefault ) {
				return state;
			}

			return {
				...state,
				[ siteId ]: new MediaQueryManager()[ method ]( ...args ),
			};
		}

		const nextManager = state[ siteId ][ method ]( ...args );

		if ( nextManager === state[ siteId ] ) {
			return state;
		}

		return {
			...state,
			[ siteId ]: nextManager,
		};
	}

	return withoutPersistence( ( state = {}, action ) => {
		switch ( action.type ) {
			case MEDIA_RECEIVE: {
				const { siteId, media, found, query } = action;
				return applyToManager( state, siteId, 'receive', true, media, { found, query } );
			}
			case MEDIA_DELETE: {
				const { siteId, mediaIds } = action;
				return applyToManager( state, siteId, 'removeItems', true, mediaIds );
			}
		}

		return state;
	} );
} )();

export const queryRequests = withoutPersistence( ( state = {}, action ) => {
	switch ( action.type ) {
		case MEDIA_REQUESTING: {
			const { siteId, query } = action;
			return {
				...state,
				[ siteId ]: {
					...state[ siteId ],
					[ MediaQueryManager.QueryKey.stringify( query ) ]: true,
				},
			};
		}
		case MEDIA_REQUEST_SUCCESS: {
			const { siteId, query } = action;
			return {
				...state,
				[ siteId ]: omit( state[ siteId ], MediaQueryManager.QueryKey.stringify( query ) ),
			};
		}
		case MEDIA_REQUEST_FAILURE: {
			const { siteId, query } = action;
			return {
				...state,
				[ siteId ]: omit( state[ siteId ], MediaQueryManager.QueryKey.stringify( query ) ),
			};
		}
	}

	return state;
} );

/**
 * Returns the updated site post requests state after an action has been
 * dispatched. The state reflects a mapping of site ID, post ID pairing to a
 * boolean reflecting whether a request for the post is in progress.
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
 */
export const mediaItemRequests = withoutPersistence( ( state = {}, action ) => {
	switch ( action.type ) {
		case MEDIA_ITEM_REQUESTING: {
			const { siteId, mediaId } = action;
			return {
				...state,
				[ siteId ]: {
					...state[ siteId ],
					[ mediaId ]: true,
				},
			};
		}
		case MEDIA_ITEM_REQUEST_SUCCESS: {
			const { siteId, mediaId } = action;
			return {
				...state,
				[ siteId ]: omit( state[ siteId ], mediaId ),
			};
		}
		case MEDIA_ITEM_REQUEST_FAILURE: {
			const { siteId, mediaId } = action;
			return {
				...state,
				[ siteId ]: omit( state[ siteId ], mediaId ),
			};
		}
	}

	return state;
} );

export default combineReducers( {
	queries,
	queryRequests,
	mediaItemRequests,
} );
