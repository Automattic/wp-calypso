/**
 * External dependencies
 */
import {
	compact,
	escape,
	flatMap,
	get,
	has,
	includes,
	map,
	noop,
	omit,
	some,
	startsWith,
} from 'lodash';
import React from 'react';

/**
 * WordPress dependencies
 */
import { createBlobURL, revokeBlobURL } from '@wordpress/blob';
import { __, sprintf } from '@wordpress/i18n';

/**
 * Browsers may use unexpected mime types, and they differ from browser to browser.
 * This function computes a flexible array of mime types from the mime type structured provided by the server.
 * Converts { jpg|jpeg|jpe: "image/jpeg" } into [ "image/jpeg", "image/jpg", "image/jpeg", "image/jpe" ]
 * The computation of this array instead of directly using the object,
 * solves the problem in chrome where mp3 files have audio/mp3 as mime type instead of audio/mpeg.
 * https://bugs.chromium.org/p/chromium/issues/detail?id=227004
 *
 * @param wpMimeTypesObject Mime type object received from the server.
 *                          Extensions are keys separated by '|' and values are mime types associated with an extension.
 *
 * @returns An array of mime types or the parameter passed if it was "falsy".
 */
export function getMimeTypesArray(
	wpMimeTypesObject?: Record< string, string >
): string[] | undefined {
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
 * @param   {Object}   $0                    Parameters object passed to the function.
 * @param   {?Array}   $0.allowedTypes       Array with the types of media that can be uploaded, if unset all types are allowed.
 * @param   {?Object}  $0.additionalData     Additional data to include in the request.
 * @param   {Array}    $0.filesList          List of files.
 * @param   {?number}  $0.maxUploadFileSize  Maximum upload size in bytes allowed for the site.
 * @param   {Function} $0.onError            Function called when an error happens.
 * @param   {Function} $0.onFileChange       Function called each time a file or a temporary representation of the file is available.
 * @param   {?Object}  $0.wpAllowedMimeTypes List of allowed mime types and file extensions.
 */
export async function uploadMedia( {
	allowedTypes,
	additionalData = {},
	filesList,
	maxUploadFileSize,
	onError = noop,
	onFileChange,
	wpAllowedMimeTypes = null,
} ) {
	// Cast filesList to array
	const files = [ ...filesList ];

	const filesSet = [];
	const setAndUpdateFiles = ( idx, value ) => {
		revokeBlobURL( get( filesSet, [ idx, 'url' ] ) );
		filesSet[ idx ] = value;
		onFileChange( compact( filesSet ) );
	};

	// Allowed type specified by consumer
	const isAllowedType = ( fileType ) => {
		if ( ! allowedTypes ) {
			return true;
		}
		return some( allowedTypes, ( allowedType ) => {
			// If a complete mimetype is specified verify if it matches exactly the mime type of the file.
			if ( includes( allowedType, '/' ) ) {
				return allowedType === fileType;
			}
			// Otherwise a general mime type is used and we should verify if the file mimetype starts with it.
			return startsWith( fileType, `${ allowedType }/` );
		} );
	};

	// Allowed types for the current WP_User
	const allowedMimeTypesForUser = getMimeTypesArray( wpAllowedMimeTypes );
	const isAllowedMimeTypeForUser = ( fileType ) => {
		return includes( allowedMimeTypesForUser, fileType );
	};

	// Build the error message including the filename
	const triggerError = ( error ) => {
		error.message = [ <strong key="filename">{ error.file.name }</strong>, ': ', error.message ];

		onError( error );
	};

	const validFiles = [];

	for ( const mediaFile of files ) {
		// Verify if user is allowed to upload this mime type.
		// Defer to the server when type not detected.
		if (
			allowedMimeTypesForUser &&
			mediaFile.type &&
			! isAllowedMimeTypeForUser( mediaFile.type )
		) {
			triggerError( {
				code: 'MIME_TYPE_NOT_ALLOWED_FOR_USER',
				message: __( 'Sorry, this file type is not permitted for security reasons.' ),
				file: mediaFile,
			} );
			continue;
		}

		// Check if the block supports this mime type.
		// Defer to the server when type not detected.
		if ( mediaFile.type && ! isAllowedType( mediaFile.type ) ) {
			triggerError( {
				code: 'MIME_TYPE_NOT_SUPPORTED',
				message: __( 'Sorry, this file type is not supported here.' ),
				file: mediaFile,
			} );
			continue;
		}

		// verify if file is greater than the maximum file upload size allowed for the site.
		if ( maxUploadFileSize && mediaFile.size > maxUploadFileSize ) {
			triggerError( {
				code: 'SIZE_ABOVE_LIMIT',
				message: __( 'This file exceeds the maximum upload size for this site.' ),
				file: mediaFile,
			} );
			continue;
		}

		// Don't allow empty files to be uploaded.
		if ( mediaFile.size <= 0 ) {
			triggerError( {
				code: 'EMPTY_FILE',
				message: __( 'This file is empty.' ),
				file: mediaFile,
			} );
			continue;
		}

		validFiles.push( mediaFile );

		// Set temporary URL to create placeholder media file, this is replaced
		// with final file from media gallery when upload is `done` below
		filesSet.push( { url: createBlobURL( mediaFile ) } );
		onFileChange( filesSet );
	}

	for ( let idx = 0; idx < validFiles.length; ++idx ) {
		const mediaFile = validFiles[ idx ];
		try {
			const savedMedia = await createMediaFromFile( mediaFile, additionalData );
			const mediaObject = {
				...omit( savedMedia, [ 'alt_text', 'source_url' ] ),
				alt: savedMedia.alt_text,
				caption: get( savedMedia, [ 'caption', 'raw' ], '' ),
				title: savedMedia.title.raw,
				url: savedMedia.source_url,
			};
			setAndUpdateFiles( idx, mediaObject );
		} catch ( error ) {
			// Reset to empty on failure.
			setAndUpdateFiles( idx, null );
			let message;
			if ( has( error, [ 'message' ] ) ) {
				message = get( error, [ 'message' ] );
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
	}
}

let nextImageId = 1;

/**
 * @param {File}    file           Media File to Save.
 * @param {?Object} additionalData Additional data to include in the request.
 *
 * Unlike the default Gutenberg behaviour, this will return something that
 * looks like what the network would have responded with so that it can
 * work in the logged-out editor.
 *
 * @returns {Promise} Media Object Promise.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function createMediaFromFile( file: File, additionalData?: Record< string, string | Blob > ) {
	const fileName = file.name || file.type.replace( '/', '.' );
	const fileNameNoSuffix = fileName.substr( fileName.lastIndexOf( '.' ) );

	const dataUrl = await new Promise< string >( ( resolve, reject ) => {
		const reader = new FileReader();
		reader.addEventListener( 'load', () => {
			// `as string` is appropriate here because we know we've called `readAsDataURL`
			resolve( reader.result as string );
		} );
		reader.addEventListener( 'error', reject );
		reader.readAsDataURL( file );
	} );

	const { width, height } = await new Promise< HTMLImageElement >( ( resolve, reject ) => {
		const img = new Image();
		img.addEventListener( 'load', () => {
			resolve( img );
		} );
		img.addEventListener( 'error', reject );
		img.src = dataUrl;
	} );

	return {
		id: nextImageId++,
		// Server returns strings with no TZ, but toISOString() does have TZ. Should be fine for logged-out editor
		date: new Date().toISOString(),
		date_gmt: new Date().toISOString(),
		modified: new Date().toISOString(),
		modified_gmt: new Date().toISOString(),
		guid: { rendered: dataUrl, raw: dataUrl },
		slug: fileNameNoSuffix,
		status: 'inherit',
		type: 'attachment',
		link: '', // Not sure where this is supposed to link to, looks like https://example.wordpress.com/fileslug
		title: {
			raw: fileNameNoSuffix,
			rendered: escape( fileNameNoSuffix ),
		},
		author: 1,
		comment_status: 'open',
		ping_status: 'closed',
		template: '',
		meta: {
			_coblocks_attr: '',
			_coblocks_dimensions: '',
			_coblocks_responsive_height: '',
			_coblocks_accordion_ie_support: '',
			advanced_seo_description: '',
			amp_status: '',
			spay_email: '',
		},
		permalink_template: '', // Hopefully we can ignore this, don't think it appears in the editor, looks like https://example.wordpress.com/?attachment_id=1
		generated_slug: fileNameNoSuffix,
		jetpack_shortlink: '', // Maybe some advanced Jetpack blocks use this? Looks like https://wp.me/a-short-code
		jetpack_sharing_enabled: true,
		jetpack_likes_enabled: true,
		description: {
			raw: '',
			rendered: '', // Not sure where this is used in the editor, but it looks like a long string of html, maybe describing properties like what's in the media modal?
		},
		caption: {
			raw: '',
			rendered: '',
		},
		alt_text: '',
		media_type: file.type.substr( 0, file.type.indexOf( '/' ) ),
		mime_type: file.type,
		media_details: {
			width,
			height,
			file: fileName,
			sizes: {
				// Server also provides "thumbnail", "medium" and "large" versions. We'll only provide "full".
				full: {
					file: fileName,
					width,
					height,
					mime_type: file.type,
					source_url: dataUrl,
				},
			},
			image_meta: {
				aperture: '0',
				credit: '',
				camera: '',
				caption: '',
				created_timestamp: '0',
				copyright: '',
				focal_length: '0',
				iso: '0',
				shutter_speed: '0',
				title: '',
				orientation: '1',
				keywords: [],
			},
			filesize: file.size,
		},
		post: null,
		source_url: dataUrl,
		missing_image_sizes: [],
		_links: {}, // Server usually provides a bunch of links here, like to the media library
	};
}
