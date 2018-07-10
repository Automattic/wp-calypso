/**
 * External Dependencies
 */
import { compact, flatMap, forEach, get, has, includes, map, noop, startsWith } from 'lodash';

/**
 * WordPress dependencies
 */
import { __, sprintf } from '@wordpress/i18n';

/**
 * WordPress dependencies
 */
import apiRequest from '@wordpress/api-request';

/**
 * Browsers may use unexpected mime types, and they differ from browser to browser.
 * This function computes a flexible array of mime types from the mime type structured provided by the server.
 * Converts { jpg|jpeg|jpe: "image/jpeg" } into [ "image/jpeg", "image/jpg", "image/jpeg", "image/jpe" ]
 * The computation of this array instead of directly using the object,
 * solves the problem in chrome where mp3 files have audio/mp3 as mime type instead of audio/mpeg.
 * https://bugs.chromium.org/p/chromium/issues/detail?id=227004
 *
 * @param {?Object} wpMimeTypesObject Mime type object received from the server.
 *                                    Extensions are keys separated by '|' and values are mime types associated with an extension.
 *
 * @return {?Array} An array of mime types or the parameter passed if it was "falsy".
 */
export function getMimeTypesArray( wpMimeTypesObject ) {
	if ( ! wpMimeTypesObject ) {
		return wpMimeTypesObject;
	}
	return flatMap( wpMimeTypesObject, ( mime, extensionsString ) => {
		const [ type ] = mime.split( '/' );
		const extensions = extensionsString.split( '|' );
		return [ mime, ...map( extensions, ( extension ) => `${ type }/${ extension }` ) ];
	} );
}

/**
 *	Media Upload is used by audio, image, gallery, video, and file blocks to
 *	handle uploading a media file when a file upload button is activated.
 *
 *	TODO: future enhancement to add an upload indicator.
 *
 * @param   {Object}   $0                   Parameters object passed to the function.
 * @param   {string}   $0.allowedType       The type of media that can be uploaded, or '*' to allow all.
 * @param   {?Object}  $0.additionalData    Additional data to include in the request.
 * @param   {Array}    $0.filesList         List of files.
 * @param   {?number}  $0.maxUploadFileSize Maximum upload size in bytes allowed for the site.
 * @param   {Function} $0.onError           Function called when an error happens.
 * @param   {Function} $0.onFileChange      Function called each time a file or a temporary representation of the file is available.
 */
export function mediaUpload( {
	allowedType,
	additionalData = {},
	filesList,
	maxUploadFileSize = get( window, [ '_wpMediaSettings', 'maxUploadSize' ], 0 ),
	onError = noop,
	onFileChange,
} ) {
	// Cast filesList to array
	const files = [ ...filesList ];

	const filesSet = [];
	const setAndUpdateFiles = ( idx, value ) => {
		filesSet[ idx ] = value;
		onFileChange( compact( filesSet ) );
	};

	// Allowed type specified by consumer
	const isAllowedType = ( fileType ) => {
		return ( allowedType === '*' ) || startsWith( fileType, `${ allowedType }/` );
	};

	// Allowed types for the current WP_User
	const allowedMimeTypesForUser = getMimeTypesArray( get( window, [ '_wpMediaSettings', 'allowedMimeTypes' ] ) );
	const isAllowedMimeTypeForUser = ( fileType ) => {
		return includes( allowedMimeTypesForUser, fileType );
	};

	files.forEach( ( mediaFile, idx ) => {
		if ( ! isAllowedType( mediaFile.type ) ) {
			return;
		}

		// verify if user is allowed to upload this mime type
		if ( allowedMimeTypesForUser && ! isAllowedMimeTypeForUser( mediaFile.type ) ) {
			onError( {
				code: 'MIME_TYPE_NOT_ALLOWED_FOR_USER',
				message: __( 'Sorry, this file type is not permitted for security reasons.' ),
				file: mediaFile,
			} );
			return;
		}

		// verify if file is greater than the maximum file upload size allowed for the site.
		if ( maxUploadFileSize && mediaFile.size > maxUploadFileSize ) {
			onError( {
				code: 'SIZE_ABOVE_LIMIT',
				message: sprintf(
					// translators: %s: file name
					__( '%s exceeds the maximum upload size for this site.' ),
					mediaFile.name
				),
				file: mediaFile,
			} );
			return;
		}

		// Set temporary URL to create placeholder media file, this is replaced
		// with final file from media gallery when upload is `done` below
		filesSet.push( { url: window.URL.createObjectURL( mediaFile ) } );
		onFileChange( filesSet );

		return createMediaFromFile( mediaFile, additionalData ).then(
			( savedMedia ) => {
				const mediaObject = {
					alt: savedMedia.alt_text,
					caption: get( savedMedia, [ 'caption', 'raw' ], '' ),
					id: savedMedia.id,
					link: savedMedia.link,
					title: savedMedia.title.raw,
					url: savedMedia.source_url,
					mediaDetails: {},
				};
				if ( has( savedMedia, [ 'media_details', 'sizes' ] ) ) {
					mediaObject.mediaDetails.sizes = get( savedMedia, [ 'media_details', 'sizes' ], {} );
				}
				setAndUpdateFiles( idx, mediaObject );
			},
			( response ) => {
				// Reset to empty on failure.
				setAndUpdateFiles( idx, null );
				let message;
				if ( has( response, [ 'responseJSON', 'message' ] ) ) {
					message = get( response, [ 'responseJSON', 'message' ] );
				} else {
					message = sprintf(
						// translators: %s: file name
						__( 'Error while uploading file %s to the media library.' ),
						mediaFile.name
					);
				}
				onError( {
					code: 'GENERAL',
					message,
					file: mediaFile,
				} );
			}
		);
	} );
}

/**
 * @param {File}    file           Media File to Save.
 * @param {?Object} additionalData Additional data to include in the request.
 *
 * @return {Promise} Media Object Promise.
 */
function createMediaFromFile( file, additionalData ) {
	// Create upload payload
	const data = new window.FormData();
	data.append( 'file', file, file.name || file.type.replace( '/', '.' ) );
	forEach( additionalData, ( ( value, key ) => data.append( key, value ) ) );
	return apiRequest( {
		path: '/wp/v2/media',
		data,
		contentType: false,
		processData: false,
		method: 'POST',
	} );
}

/**
 * Utility used to preload an image before displaying it.
 *
 * @param   {string}  url Image Url.
 * @return {Promise}     Promise resolved once the image is preloaded.
 */
export function preloadImage( url ) {
	return new Promise( ( resolve ) => {
		const newImg = new window.Image();
		newImg.onload = function() {
			resolve( url );
		};
		newImg.src = url;
	} );
}
