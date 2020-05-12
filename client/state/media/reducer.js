/**
 * External dependencies
 */

import { isEmpty, mapValues, omit, pickBy, without } from 'lodash';
/**
 * Internal dependencies
 */
import {
	MEDIA_DELETE,
	MEDIA_ERRORS_CLEAR,
	MEDIA_ITEM_ERRORS_CLEAR,
	MEDIA_ITEM_CREATE,
	MEDIA_ITEM_REQUEST_FAILURE,
	MEDIA_ITEM_REQUEST_SUCCESS,
	MEDIA_ITEM_REQUESTING,
	MEDIA_LIBRARY_SELECTED_ITEMS_UPDATE,
	MEDIA_RECEIVE,
	MEDIA_REQUEST_FAILURE,
	MEDIA_REQUEST_SUCCESS,
	MEDIA_REQUESTING,
	MEDIA_SOURCE_CHANGE,
} from 'state/action-types';
import { combineReducers, withoutPersistence } from 'state/utils';
import MediaQueryManager from 'lib/query-manager/media';
import { validateMediaItem } from 'lib/media/utils';
import { ValidationErrors as MediaValidationErrors } from 'lib/media/constants';

const isExternalMediaError = ( message ) =>
	message.error && ( message.error === 'servicefail' || message.error === 'keyring_token_error' );

const isMediaError = ( action ) =>
	action.error && ( action.siteId || isExternalMediaError( action.error ) );

/**
 * Returns the updated media errors state after an action has been
 * dispatched. The state reflects a mapping of site ID, media ID pairing to
 * an array of errors that occurred for that corresponding media item.
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
 */
export const errors = ( state = {}, action ) => {
	switch ( action.type ) {
		case MEDIA_ITEM_CREATE: {
			if ( ! action.site || ! action.transientMedia ) {
				return state;
			}

			const items = Array.isArray( action.transientMedia )
				? action.transientMedia
				: [ action.transientMedia ];
			const mediaErrors = items.reduce( function ( memo, item ) {
				const itemErrors = validateMediaItem( action.site, item );
				if ( itemErrors.length ) {
					memo[ item.ID ] = itemErrors;
				}

				return memo;
			}, {} );

			return {
				...state,
				[ action.site.ID ]: {
					...state[ action.site.ID ],
					...mediaErrors,
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
					case 'upload_error':
						if ( error.message.startsWith( 'Not enough space to upload' ) ) {
							return MediaValidationErrors.NOT_ENOUGH_SPACE;
						}
						if ( error.message.startsWith( 'You have used your space quota' ) ) {
							return MediaValidationErrors.EXCEEDS_PLAN_STORAGE_LIMIT;
						}
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

/**
 * Returns the media library selected items state after an action has been
 * dispatched. The state reflects a mapping of site ID pairing to an array
 * that contains IDs of media items.
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}       Updated state
 */
export const selectedItems = withoutPersistence( ( state = {}, action ) => {
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
} );

export const mediaItems = withoutPersistence( ( state = {}, action ) => {
	switch ( action.type ) {
		case MEDIA_SOURCE_CHANGE: {
			/**
			 * Clear the media for the site.
			 *
			 * Dispatched when the media source changes (e.g., switching from uploaded media to
			 * external media like Google Photos).
			 */
			const { siteId } = action;
			return {
				...state,
				[ siteId ]: {
					actual: {},
					transient: {},
				},
			};
		}

		case MEDIA_ITEM_CREATE: {
			/**
			 * Eagerly save the transient media.
			 *
			 * Dispatched right before an item is uploaded to be created.
			 *
			 * See related handlers MEDIA_REQUEST_SUCCESS and MEDIA_SUCCESS_FAILURE
			 */
			const { site, transientMedia } = action;
			const { [ site.ID ]: { transient = {} } = {} } = state;

			return {
				...state,
				[ site.ID ]: {
					...state[ site.ID ],
					transient: {
						...transient,
						[ transientMedia.ID ]: transientMedia,
					},
				},
			};
		}
		case MEDIA_RECEIVE: {
			/**
			 * Handle either a new page of media or a successfully uploaded media.
			 *
			 * Dispatched when:
			 * 1. a media item is successfully uploaded; or
			 * 2. a new page of media items is received (as in a search or page navigation); or
			 * 3. a media item is edited/changed; or
			 * 4. a single media item is retrieved.
			 *
			 * Because we're handling all of these in one action, and because we eagerly set
			 * newly uploaded media in MEDIA_ITEM_CREATE, we need to be careful
			 * not to duplicate. Luckily here we just overwrite the ids in our `reduce`
			 * and forget about it.
			 */
			const { siteId, media: newMedia } = action;
			const { [ siteId ]: { actual: existingMedia = {} } = {} } = state;

			return {
				...state,
				[ siteId ]: {
					...state[ siteId ],
					actual: newMedia.reduce(
						( aggregatedMedia, newMediaItem ) => ( {
							...aggregatedMedia,
							[ newMediaItem.ID ]: newMediaItem,
						} ),
						existingMedia
					),
				},
			};
		}
		case MEDIA_DELETE: {
			/**
			 * Remove the media from the site's media.
			 *
			 * Dispatched when a media item is deleted.
			 */
			const { siteId, mediaIds } = action;
			const { [ siteId ]: { actual: existingMedia = {} } = {} } = state;

			return {
				...state,
				[ siteId ]: {
					...state[ siteId ],
					actual: omit( existingMedia, mediaIds ),
				},
			};
		}
		case MEDIA_ITEM_REQUEST_FAILURE:
		case MEDIA_ITEM_REQUEST_SUCCESS: {
			/**
			 * We've eagerly saved the transient media in MEDIA_ITEM_CREATE, and
			 * now we know the upload was successful, so we can remove the transient
			 * item. MEDIA_RECEIVE will handle saving the actual final version of
			 * the uploaded media item.
			 *
			 * Likewise, in the case of a failure, we must also remove the failed
			 * media item.
			 *
			 * Dispatched when uploading the media item is successful.
			 */
			const { siteId, mediaId } = action;
			const { [ siteId ]: { transient = {} } = {} } = state;
			return {
				...state,
				[ siteId ]: {
					...state[ siteId ],
					transient: omit( transient, mediaId ),
				},
			};
		}
	}

	return state;
} );

export default combineReducers( {
	errors,
	queries,
	queryRequests,
	mediaItemRequests,
	selectedItems,
	mediaItems,
} );
