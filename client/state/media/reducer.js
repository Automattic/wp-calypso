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

export default combineReducers( {
	errors,
	queries,
	queryRequests,
	mediaItemRequests,
} );
