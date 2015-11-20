/**
 * External dependencies
 */
var mapValues = require( 'lodash/object/mapValues' ),
	without = require( 'lodash/array/without' ),
	isEmpty = require( 'lodash/lang/isEmpty' ),
	pick = require( 'lodash/object/pick' );

/**
 * Internal dependencies
 */
var Dispatcher = require( 'dispatcher' ),
	emitter = require( 'lib/mixins/emitter' ),
	sites = require( 'lib/sites-list' )(),
	MediaUtils = require( './utils' ),
	MediaValidationErrors = require( './constants' ).ValidationErrors;

/**
 * Module variables
 */
var MediaValidationStore = {},
	_errors;

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
 * @type {Object}
 * @private
 */
_errors = {};

emitter( MediaValidationStore );

function ensureErrorsObjectForSite( siteId ) {
	if ( siteId in _errors ) {
		return;
	}

	_errors[ siteId ] = {};
}

function validateItem( siteId, item ) {
	var site = sites.getSite( siteId ),
		itemErrors = [];

	if ( ! site ) {
		return;
	}

	if ( ! MediaUtils.isSupportedFileTypeForSite( item, site ) ) {
		itemErrors.push( MediaValidationErrors.FILE_TYPE_UNSUPPORTED );
	}

	if ( true === MediaUtils.isExceedingSiteMaxUploadSize( item.size, site ) ) {
		itemErrors.push( MediaValidationErrors.EXCEEDS_MAX_UPLOAD_SIZE );
	}

	if ( itemErrors.length ) {
		ensureErrorsObjectForSite( siteId );
		_errors[ siteId ][ item.ID ] = itemErrors;
	}
}

function clearValidationErrors( siteId, itemId ) {
	if ( ! ( siteId in _errors ) ) {
		return;
	}

	if ( itemId ) {
		delete _errors[ siteId ][ itemId ];
	} else {
		delete _errors[ siteId ];
	}
}

/**
 * Update the errors object for a site by picking only items where errors still
 * exist after excluding all errors for that item matching the specified type.
 *
 * @param {Number}               siteId    The site ID
 * @param {MediaValidationError} errorType The error type to remove
 */
function clearValidationErrorsByType( siteId, errorType ) {
	if ( ! ( siteId in _errors ) ) {
		return;
	}

	_errors[ siteId ] = pick(
		mapValues( _errors[ siteId ], ( errors ) => without( errors, errorType ) ),
		( errors ) => ! isEmpty( errors )
	);
}

function receiveServerError( siteId, itemId, errors ) {
	ensureErrorsObjectForSite( siteId );

	_errors[ siteId ][ itemId ] = errors.map( ( error ) => {
		let errorType;

		switch ( error.error ) {
			case 'http_404':
				errorType = MediaValidationErrors.UPLOAD_VIA_URL_404;
				break;
			default:
				errorType = MediaValidationErrors.SERVER_ERROR;
				break;
		}

		return errorType;
	} );
}

MediaValidationStore.getAllErrors = function( siteId ) {
	return _errors[ siteId ] || {};
};

MediaValidationStore.getErrors = function( siteId, itemId ) {
	if ( ! ( siteId in _errors ) ) {
		return [];
	}

	return _errors[ siteId ][ itemId ] || [];
};

MediaValidationStore.hasErrors = function( siteId, itemId ) {
	if ( itemId ) {
		return MediaValidationStore.getErrors( siteId, itemId ).length;
	}

	return Object.keys( MediaValidationStore.getAllErrors( siteId ) ).length;
};

MediaValidationStore.dispatchToken = Dispatcher.register( function( payload ) {
	var action = payload.action,
		items, errors;

	switch ( action.type ) {
		case 'CREATE_MEDIA_ITEM':
			if ( ! action.siteId || ! action.data ) {
				break;
			}

			items = Array.isArray( action.data.media ) ? action.data.media : [ action.data ];
			errors = items.reduce( function( memo, item ) {
				var itemErrors;

				validateItem( action.siteId, item );

				itemErrors = MediaValidationStore.getErrors( action.siteId, item.ID );
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
			// Track any errors which occurred during upload
			if ( ! action.error || ! action.id ) {
				break;
			}

			if ( Array.isArray( action.error.errors ) ) {
				errors = action.error.errors;
			} else {
				errors = [ action.error ];
			}

			receiveServerError( action.siteId, action.id, errors );
			MediaValidationStore.emit( 'change' );
			break;

		case 'CLEAR_MEDIA_VALIDATION_ERRORS':
			if ( ! action.siteId ) {
				break;
			}

			if ( action.errorType ) {
				clearValidationErrorsByType( action.siteId, action.errorType );
			} else {
				clearValidationErrors( action.siteId, action.itemId );
			}

			MediaValidationStore.emit( 'change' );
			break;
	}
} );

module.exports = MediaValidationStore;
