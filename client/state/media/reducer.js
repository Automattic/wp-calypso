import { merge, omit } from '@automattic/js-utils';
import { withStorageKey } from '@automattic/state-utils';
import isEqual from 'fast-deep-equal/es6';
import MediaQueryManager from 'calypso/lib/query-manager/media';
import withQueryManager from 'calypso/lib/query-manager/with-query-manager';
import {
	MEDIA_DELETE,
	MEDIA_ITEM_CREATE,
	MEDIA_ITEM_REQUEST_FAILURE,
	MEDIA_RECEIVE,
	MEDIA_REQUEST,
	MEDIA_REQUEST_FAILURE,
	MEDIA_REQUEST_SUCCESS,
	MEDIA_SET_NEXT_PAGE_HANDLE,
	MEDIA_SET_QUERY,
} from 'calypso/state/action-types';
import { transformSite as transformSiteTransientItems } from 'calypso/state/media/utils/transientItems';
import { combineReducers } from 'calypso/state/utils';

export const queries = ( state = {}, action ) => {
	switch ( action.type ) {
		case MEDIA_RECEIVE: {
			const { siteId, media, found, query } = action;
			return withQueryManager(
				state,
				siteId,
				( m ) => m.receive( media, { found, query } ),
				() => new MediaQueryManager()
			);
		}
		case MEDIA_DELETE: {
			const { siteId, mediaIds } = action;
			return withQueryManager( state, siteId, ( m ) => m.removeItems( mediaIds ) );
		}
	}

	return state;
};

/**
 * A reducer juggling transient media items. Transient media
 * items are created in two cases: when an item is being uploaded
 * and when an item is being updated.
 *
 * In each of those cases, an action is dispatched before a request
 * is made to the server with the transient media item that is being
 * POST/PUT to the server. These transient media items are first class
 * citizens until the server responds with the "actual" or "saved"
 * media item. Transient media items should be fully usable and their
 * IDs (which are generated client side and replaced on the server by
 * an actual database ID) must continue to be valid references to a single
 * media item, even after the item is fully saved on the server.
 *
 * This requirement means that when the server responds with a saved
 * media item, we need to create a mapping between the transient ID
 * and the actual ID of the item. This mapping allows anything still
 * using the transient ID to reference an already saved item to get back
 * the saved item rather than the trasient item.
 * @param {Object} state The previous state.
 * @param {Object} action The action.
 * @returns {Object} The next state.
 */
export const transientItems = ( state = {}, action ) => {
	switch ( action.type ) {
		case MEDIA_ITEM_CREATE: {
			/**
			 * Save the transient media item.
			 */
			const {
				site: { ID: siteId },
				transientMedia,
			} = action;

			return transformSiteTransientItems(
				state,
				siteId,
				( { transientItems: existingTransientItems, ...rest } ) => ( {
					...rest,
					transientItems: {
						...existingTransientItems,
						[ transientMedia.ID ]: transientMedia,
					},
				} )
			);
		}
		case MEDIA_RECEIVE: {
			/**
			 * Remove the transient media item and create a mapping
			 * between the transient ID and the saved ID.
			 *
			 * The `queries` reducer is responsible for saving the saved media
			 * item into the `MediaQueryManager`.
			 */
			const { siteId, media: savedMedia } = action;

			/**
			 * The `transientId` property on media items is optional and when
			 * present indicates a media item that was previously transient but
			 * has now been persisted. Because we only care about transient media
			 * in this reducer, if none of the received media were previously
			 * transient, we can skip this work.
			 */
			const justSavedMedia = savedMedia.filter( ( mediaItem ) => mediaItem.transientId != null );

			if ( justSavedMedia.length === 0 ) {
				return state;
			}

			const transientItemIdsToExclude = justSavedMedia.map(
				( mediaItem ) => mediaItem.transientId
			);

			const additionalTransientIdsToServerIds = justSavedMedia.reduce(
				( acc, mediaItem ) => ( { ...acc, [ mediaItem.transientId ]: mediaItem.ID } ),
				{}
			);

			return transformSiteTransientItems(
				state,
				siteId,
				( { transientIdsToServerIds, transientItems: existingTransientItems } ) => ( {
					transientIdsToServerIds: {
						...transientIdsToServerIds,
						...additionalTransientIdsToServerIds,
					},
					transientItems: omit( existingTransientItems, transientItemIdsToExclude ),
				} )
			);
		}

		case MEDIA_ITEM_REQUEST_FAILURE: {
			/**
			 * The request to create the media failed so we need
			 * to remove the transient item.
			 */
			const { siteId, mediaId: transientId } = action;

			return transformSiteTransientItems(
				state,
				siteId,
				( { transientItems: existingTransientItems, ...rest } ) => ( {
					...rest,
					transientItems: omit( existingTransientItems, transientId ),
				} )
			);
		}
	}

	return state;
};

/**
 * Returns the updated site post requests state after an action has been
 * dispatched. The state reflects a mapping of site ID, media ID pairing to a
 * boolean reflecting whether a request for the media item is in progress.
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @returns {Object}        Updated state
 */
export const fetching = ( state = {}, action ) => {
	switch ( action.type ) {
		case MEDIA_REQUEST: {
			const siteId = action.siteId;

			return {
				...state,
				[ siteId ]: Object.assign( {}, state[ siteId ], {
					nextPage: true,
				} ),
			};
		}

		case MEDIA_REQUEST_SUCCESS:
		case MEDIA_REQUEST_FAILURE: {
			const siteId = action.siteId;

			return {
				...state,
				[ siteId ]: Object.assign( {}, state[ siteId ], {
					nextPage: false,
				} ),
			};
		}

		case MEDIA_SET_NEXT_PAGE_HANDLE: {
			const { siteId, mediaRequestMeta } = action;

			return {
				...state,
				[ siteId ]: merge( {}, state[ siteId ], {
					nextPageHandle: mediaRequestMeta?.next_page || null,
				} ),
			};
		}

		case MEDIA_SET_QUERY: {
			const { siteId, query } = action;

			const newState = { ...state[ siteId ], query };

			if ( ! isEqual( query, state[ siteId ]?.query ) ) {
				delete newState.nextPageHandle;
				newState.nextPage = false;
			}

			return {
				...state,
				[ siteId ]: newState,
			};
		}
	}

	return state;
};

const combinedReducer = combineReducers( {
	queries,
	transientItems,
	fetching,
} );

export default withStorageKey( 'media', combinedReducer );
