/**
 * External dependencies
 */

import { isEmpty, mapValues, pickBy, without } from 'lodash';

/**
 * Internal dependencies
 */
import Dispatcher from 'dispatcher';
import emitter from 'lib/mixins/emitter';
import * as MediaUtils from './utils';
import { ValidationErrors as MediaValidationErrors } from './constants';

/**
 * Module variables
 */
const MediaValidationStore = {
	_errors: {},
};
const ERROR_GLOBAL_ITEM_ID = 0;

/**
 * Errors are represented as an object, mapping a site to an object of items
 * where errors exist. Each site's item errors are reflected as an array of
 * constant error types.
 *
 * {
 *     [ siteId ]: {
 *         [ itemId ]: [
 *             MediaValidationErrors.FILE_TYPE_UNSUPPORTED,
 *             MediaValidationErrors.EXCEEDS_MAX_UPLOAD_SIZE
 *         ]
 *     }
 * }
 *
 * @type {object}
 * @private
 */

emitter( MediaValidationStore );

function ensureErrorsObjectForSite( siteId ) {
	if ( siteId in MediaValidationStore._errors ) {
		return;
	}

	MediaValidationStore._errors[ siteId ] = {};
}

const isExternalError = message =>
	message.error && ( message.error === 'servicefail' || message.error === 'keyring_token_error' );
const isMediaError = action => action.error && ( action.id || isExternalError( action.error ) );

MediaValidationStore.validateItem = function( site, item ) {
	const itemErrors = [];

	if ( ! site ) {
		return;
	}

	if ( ! MediaUtils.isSupportedFileTypeForSite( item, site ) ) {
		if ( MediaUtils.isSupportedFileTypeInPremium( item, site ) ) {
			itemErrors.push( MediaValidationErrors.FILE_TYPE_NOT_IN_PLAN );
		} else {
			itemErrors.push( MediaValidationErrors.FILE_TYPE_UNSUPPORTED );
		}
	}

	if ( true === MediaUtils.isExceedingSiteMaxUploadSize( item, site ) ) {
		itemErrors.push( MediaValidationErrors.EXCEEDS_MAX_UPLOAD_SIZE );
	}

	if ( itemErrors.length ) {
		ensureErrorsObjectForSite( site.ID );
		MediaValidationStore._errors[ site.ID ][ item.ID ] = itemErrors;
	}
};

MediaValidationStore.clearValidationErrors = function( siteId, itemId ) {
	if ( ! ( siteId in MediaValidationStore._errors ) ) {
		return;
	}

	if ( itemId ) {
		delete MediaValidationStore._errors[ siteId ][ itemId ];
	} else {
		delete MediaValidationStore._errors[ siteId ];
	}
};

/**
 * Update the errors object for a site by picking only items where errors still
 * exist after excluding all errors for that item matching the specified type.
 *
 * @param {number}               siteId    The site ID
 * @param {MediaValidationError} errorType The error type to remove
 */
MediaValidationStore.clearValidationErrorsByType = function( siteId, errorType ) {
	if ( ! ( siteId in MediaValidationStore._errors ) ) {
		return;
	}

	MediaValidationStore._errors[ siteId ] = pickBy(
		mapValues( MediaValidationStore._errors[ siteId ], errors => without( errors, errorType ) ),
		errors => ! isEmpty( errors )
	);
};

function receiveServerError( siteId, itemId, errors ) {
	ensureErrorsObjectForSite( siteId );

	MediaValidationStore._errors[ siteId ][ itemId ] = errors.map( error => {
		switch ( error.error ) {
			case 'http_404':
				return MediaValidationErrors.UPLOAD_VIA_URL_404;
			case 'upload_error':
				if ( error.message.indexOf( 'Not enough space to upload' ) === 0 ) {
					return MediaValidationErrors.NOT_ENOUGH_SPACE;
				}
				if ( error.message.indexOf( 'You have used your space quota' ) === 0 ) {
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
}

MediaValidationStore.getAllErrors = function( siteId ) {
	return MediaValidationStore._errors[ siteId ] || {};
};

MediaValidationStore.getErrors = function( siteId, itemId ) {
	if ( ! ( siteId in MediaValidationStore._errors ) ) {
		return [];
	}

	return MediaValidationStore._errors[ siteId ][ itemId ] || [];
};

MediaValidationStore.hasErrors = function( siteId, itemId ) {
	if ( itemId ) {
		return MediaValidationStore.getErrors( siteId, itemId ).length;
	}

	return Object.keys( MediaValidationStore.getAllErrors( siteId ) ).length;
};

MediaValidationStore.dispatchToken = Dispatcher.register( function( payload ) {
	const action = payload.action;
	let items, errors;

	switch ( action.type ) {
		case 'CREATE_MEDIA_ITEM':
			if ( ! action.siteId || ! action.data ) {
				break;
			}

			items = Array.isArray( action.data.media ) ? action.data.media : [ action.data ];
			errors = items.reduce( function( memo, item ) {
				MediaValidationStore.validateItem( action.site, item );

				const itemErrors = MediaValidationStore.getErrors( action.siteId, item.ID );
				if ( itemErrors.length ) {
					memo[ item.ID ] = itemErrors;
				}

				return memo;
			}, {} );

			if ( errors && Object.keys( errors ).length ) {
				action.error = MediaValidationStore.getAllErrors( action.siteId );
				MediaValidationStore.emit( 'change' );
			}
			break;

		case 'RECEIVE_MEDIA_ITEM':
		case 'RECEIVE_MEDIA_ITEMS':
			// Track any errors which occurred during upload or getting external media
			if ( ! isMediaError( action ) ) {
				break;
			}

			if ( Array.isArray( action.error.errors ) ) {
				errors = action.error.errors;
			} else {
				errors = [ action.error ];
			}

			receiveServerError( action.siteId, action.id ? action.id : ERROR_GLOBAL_ITEM_ID, errors );
			MediaValidationStore.emit( 'change' );
			break;

		case 'CHANGE_MEDIA_SOURCE':
		case 'CLEAR_MEDIA_VALIDATION_ERRORS':
			if ( ! action.siteId ) {
				break;
			}

			if ( action.errorType ) {
				MediaValidationStore.clearValidationErrorsByType( action.siteId, action.errorType );
			} else {
				MediaValidationStore.clearValidationErrors( action.siteId, action.itemId );
			}

			MediaValidationStore.emit( 'change' );
			break;
	}
} );

export default MediaValidationStore;
