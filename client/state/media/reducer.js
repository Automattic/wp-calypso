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
	MEDIA_SET_QUERY,
	MEDIA_SOURCE_CHANGE,
} from 'state/action-types';
import { combineReducers, withoutPersistence } from 'state/utils';
import MediaQueryManager from 'lib/query-manager/media';
import { validateMediaItem } from 'lib/media/utils';
import { ValidationErrors as MediaValidationErrors } from 'lib/media/constants';

import {
	areQueriesMatching,
	cleanQuery,
	isItemMatchingQuery,
	pluckActiveQueryAndMedia,
	getSafeNextListStoreState,
} from 'state/media/list-store-utils';

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

			return {
				...state,
				[ siteId ]: [ ...( state[ siteId ] ?? [] ), ...media.map( ( mediaItem ) => mediaItem.ID ) ],
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

/**
 * @typedef {object} MediaListStoreState
 * @property { {[siteId: string]: object} } activeQueries The active query for each site
 * @property { {[siteId: string]: number[]} } media An unordered list of media ids for each site
 */

export const listStore = withoutPersistence(
	/**
	 * @param {MediaListStoreState} state Current state
	 * @param {object} action Action payload
	 * @returns {MediaListStoreState} Updated state
	 */
	( state = { activeQueries: {}, media: {} }, action ) => {
		switch ( action.type ) {
			case MEDIA_REQUESTING: {
				const { siteId } = action;
				const { activeQuery } = pluckActiveQueryAndMedia( state, siteId );
				return getSafeNextListStoreState( state, siteId, {
					activeQuery: { ...activeQuery, isFetchingNextPage: true },
				} );
			}
			case MEDIA_ITEM_REQUEST_SUCCESS: {
				const { siteId } = action;
				const { activeQuery } = pluckActiveQueryAndMedia( state, siteId );
				return getSafeNextListStoreState( state, siteId, {
					activeQuery: { ...activeQuery, isFetchingNextPage: false },
				} );
			}
			case MEDIA_ITEM_REQUEST_FAILURE:
				return state;

			case MEDIA_SET_QUERY: {
				const { siteId, query: newQuery } = action;
				const { activeQuery: existingQuery } = pluckActiveQueryAndMedia( state, siteId );

				// if the new query isn't effectively the same as the old query, then we need to clear the list of media ids
				const shouldClearMedia = ! areQueriesMatching( existingQuery, newQuery );

				// don't use safety util so we can remove the media list for the site
				return {
					...state,
					activeQueries: {
						[ siteId ]: cleanQuery( newQuery ),
					},
					media: shouldClearMedia ? omit( state.media, siteId ) : state.media,
				};
			}
			case MEDIA_SOURCE_CHANGE: {
				const { siteId } = action;
				const { activeQuery } = pluckActiveQueryAndMedia( state, siteId );

				// don't use safety util so we can remove the media list for the site
				return {
					...state,
					media: omit( state.media, siteId ),
					activeQueries: {
						...state.activeQueries,
						[ siteId ]: {
							...omit( activeQuery, 'nextPageHandle' ),
							// reset isFetchingNextPage to false for the site being cleared
							isFetchingNextPage: false,
						},
					},
				};
			}
			case MEDIA_ITEM_CREATE: {
				const { site, transientMedia } = action;
				const { activeQuery, media: existingMedia } = pluckActiveQueryAndMedia( state, site.ID );

				if ( ! isItemMatchingQuery( transientMedia, activeQuery ) ) {
					return state;
				}

				return getSafeNextListStoreState( state, site.ID, {
					media: [ ...existingMedia, transientMedia.ID ],
				} );
			}
			case MEDIA_RECEIVE: {
				const { siteId, media, query } = action;

				const { media: existingMedia } = pluckActiveQueryAndMedia( state, siteId );

				const nextMedia = [
					...existingMedia,
					media.filter(
						( mediaItem ) =>
							! existingMedia.includes( mediaItem.ID ) && isItemMatchingQuery( mediaItem, query )
					),
				];

				return getSafeNextListStoreState( state, siteId, {
					...state,
					media: nextMedia,
				} );
			}
			case MEDIA_DELETE: {
				const { siteId, mediaIds: deletedMediaIds } = action;
				const { media: existingMedia } = pluckActiveQueryAndMedia( state, siteId );

				return getSafeNextListStoreState( state, siteId, {
					media: existingMedia.filter(
						( existingMediaId ) => ! deletedMediaIds.includes( existingMediaId )
					),
				} );
			}
		}
	}
);

export default combineReducers( {
	errors,
	queries,
	queryRequests,
	mediaItemRequests,
	selectedItems,
} );
