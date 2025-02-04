import { withStorageKey } from '@automattic/state-utils';
import { isEmpty, mapValues, omit, pickBy, without, merge, isEqual } from 'lodash';
import { ValidationErrors as MediaValidationErrors } from 'calypso/lib/media/constants';
import isTransientMediaId from 'calypso/lib/media/utils/is-transient-media-id';
import MediaQueryManager from 'calypso/lib/query-manager/media';
import withQueryManager from 'calypso/lib/query-manager/with-query-manager';
import {
	MEDIA_DELETE,
	MEDIA_ERRORS_CLEAR,
	MEDIA_ITEM_ERRORS_CLEAR,
	MEDIA_ITEM_ERRORS_SET,
	MEDIA_ITEM_CREATE,
	MEDIA_ITEM_REQUEST_FAILURE,
	MEDIA_ITEM_REQUEST_SUCCESS,
	MEDIA_LIBRARY_SELECTED_ITEMS_UPDATE,
	MEDIA_RECEIVE,
	MEDIA_REQUEST,
	MEDIA_REQUEST_FAILURE,
	MEDIA_REQUEST_SUCCESS,
	MEDIA_SET_NEXT_PAGE_HANDLE,
	MEDIA_SOURCE_CHANGE,
	MEDIA_SET_QUERY,
	MEDIA_CLEAR_SITE,
	MEDIA_ITEM_EDIT,
	MEDIA_PHOTOS_PICKER_SESSION_SET,
	MEDIA_PHOTOS_PICKER_FEATURE_FLAG_SET,
} from 'calypso/state/action-types';
import { transformSite as transformSiteTransientItems } from 'calypso/state/media/utils/transientItems';
import { combineReducers } from 'calypso/state/utils';

const isExternalMediaError = ( message ) =>
	message.error && ( message.error === 'servicefail' || message.error === 'keyring_token_error' );

const isMediaError = ( action ) =>
	action.error && ( action.siteId || isExternalMediaError( action.error ) );

/**
 * Returns the updated media errors state after an action has been
 * dispatched. The state reflects a mapping of site ID, media ID pairing to
 * an array of errors that occurred for that corresponding media item.
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @returns {Object}        Updated state
 */
export const errors = ( state = {}, action ) => {
	switch ( action.type ) {
		case MEDIA_ITEM_ERRORS_SET: {
			const { siteId, mediaId, errors: mediaItemErrors } = action;

			return {
				...state,
				[ siteId ]: {
					...state[ siteId ],
					[ mediaId ]: mediaItemErrors,
				},
			};
		}

		case MEDIA_ITEM_REQUEST_FAILURE:
		case MEDIA_REQUEST_FAILURE: {
			// Track any errors which occurred during upload or getting external media
			if ( ! isMediaError( action ) ) {
				return state;
			}

			const mediaErrors = Array.isArray( action.error.errors )
				? action.error.errors
				: [ action.error ];

			const sanitizedErrors = mediaErrors.map( ( error ) => {
				switch ( error.error ) {
					case 'http_404':
						return MediaValidationErrors.UPLOAD_VIA_URL_404;
					case 'rest_upload_limited_space':
						return MediaValidationErrors.NOT_ENOUGH_SPACE;
					case 'rest_upload_file_too_big':
						return MediaValidationErrors.EXCEEDS_MAX_UPLOAD_SIZE;
					case 'rest_upload_user_quota_exceeded':
						return MediaValidationErrors.EXCEEDS_PLAN_STORAGE_LIMIT;
					case 'upload_error':
						return MediaValidationErrors.SERVER_ERROR;
					case 'keyring_token_error':
						return MediaValidationErrors.SERVICE_AUTH_FAILED;
					case 'servicefail':
						return MediaValidationErrors.SERVICE_FAILED;
					case 'service_unavailable':
						return MediaValidationErrors.SERVICE_UNAVAILABLE;
					default:
						return MediaValidationErrors.SERVER_ERROR;
				}
			} );

			return {
				...state,
				[ action.siteId ]: {
					...state[ action.siteId ],
					[ action?.mediaId ?? 0 ]: sanitizedErrors,
				},
			};
		}

		case MEDIA_ERRORS_CLEAR:
			if ( ! action.siteId ) {
				return state;
			}

			return {
				...state,
				[ action.siteId ]: pickBy(
					mapValues( state[ action.siteId ], ( mediaErrors ) =>
						without( mediaErrors, action.errorType )
					),
					( mediaErrors ) => ! isEmpty( mediaErrors )
				),
			};

		case MEDIA_ITEM_ERRORS_CLEAR: {
			if ( ! action.siteId || ! action.mediaId ) {
				return state;
			}

			return {
				...state,
				[ action.siteId ]: {
					...omit( state[ action.siteId ], [ [ action.siteId ], [ action.mediaId ] ] ),
				},
			};
		}

		case MEDIA_SOURCE_CHANGE: {
			if ( ! action.siteId ) {
				return state;
			}

			return omit( state, action.siteId );
		}
	}

	return state;
};

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
		case MEDIA_ITEM_EDIT: {
			const { siteId, mediaItem } = action;
			return withQueryManager( state, siteId, ( m ) => m.receive( mediaItem, { patch: true } ) );
		}
		case MEDIA_SOURCE_CHANGE:
		case MEDIA_CLEAR_SITE: {
			if ( ! action.siteId ) {
				return state;
			}

			return omit( state, action.siteId );
		}
	}

	return state;
};

/**
 * Returns the media library selected items state after an action has been
 * dispatched. The state reflects a mapping of site ID pairing to an array
 * that contains IDs of media items.
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @returns {Object}       Updated state
 */
export const selectedItems = ( state = {}, action ) => {
	switch ( action.type ) {
		case MEDIA_SOURCE_CHANGE: {
			const { siteId } = action;
			return {
				...state,
				[ siteId ]: [],
			};
		}
		case MEDIA_LIBRARY_SELECTED_ITEMS_UPDATE: {
			const { media, siteId } = action;
			return {
				...state,
				[ siteId ]: media.map( ( mediaItem ) => mediaItem.ID ),
			};
		}
		case MEDIA_ITEM_CREATE: {
			const { site, transientMedia } = action;

			if ( ! action.site || ! action.transientMedia ) {
				return state;
			}

			return {
				...state,
				[ site.ID ]: [ ...( state[ site.ID ] ?? [] ), transientMedia.ID ],
			};
		}
		case MEDIA_RECEIVE: {
			const { media, siteId } = action;

			// We only want to auto-mark as selected media that has just been uploaded
			if ( action.found || action.query ) {
				return state;
			}

			const { [ siteId ]: existingMediaIds = [] } = state;

			const nextMediaIds = media.reduce(
				( aggregatedMediaIds, mediaItem ) =>
					// avoid duplicating IDs
					existingMediaIds.includes( mediaItem.ID )
						? aggregatedMediaIds
						: [ ...aggregatedMediaIds, mediaItem.ID ],
				[ ...existingMediaIds ]
			);

			return {
				...state,
				[ siteId ]: nextMediaIds,
			};
		}
		case MEDIA_ITEM_REQUEST_SUCCESS: {
			const { mediaId: transientMediaId, siteId } = action;

			// We only want to deselect if it is a transient media item
			if ( ! isTransientMediaId( transientMediaId ) ) {
				return state;
			}

			const media = state[ siteId ] ?? [];

			return {
				...state,
				[ siteId ]: media.filter( ( mediaId ) => transientMediaId !== mediaId ),
			};
		}
		case MEDIA_DELETE: {
			const { mediaIds, siteId } = action;
			return {
				...state,
				[ siteId ]: state[ siteId ].filter( ( mediaId ) => ! mediaIds.includes( mediaId ) ),
			};
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
		case MEDIA_SOURCE_CHANGE: {
			/**
			 * Clear the media for the site.
			 *
			 * Dispatched when the media source changes (e.g., switching from uploaded media to
			 * external media like Google Photos).
			 */
			return transformSiteTransientItems( state, action.siteId, () => ( {
				transientItems: {},
				transientIdsToServerIds: {},
			} ) );
		}

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

export const googlePhotosPicker = ( state = {}, action ) => {
	switch ( action.type ) {
		case MEDIA_PHOTOS_PICKER_SESSION_SET: {
			return {
				...state,
				session: action.session,
			};
		}

		case MEDIA_PHOTOS_PICKER_FEATURE_FLAG_SET: {
			return {
				...state,
				featureEnabled: action.enabled,
			};
		}
	}

	return state;
};

const combinedReducer = combineReducers( {
	errors,
	queries,
	selectedItems,
	transientItems,
	fetching,
	googlePhotosPicker,
} );

export default withStorageKey( 'media', combinedReducer );
