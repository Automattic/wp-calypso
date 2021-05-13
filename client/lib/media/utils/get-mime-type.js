/**
 * Internal dependencies
 */
import { MimeTypes } from 'calypso/lib/media/constants';
import { getFileExtension } from 'calypso/lib/media/utils/get-file-extension';

/**
 * Given a media string, File, or object, returns the MIME type if one can
 * be determined.
 *
 * @example
 * getMimeType( 'example.gif' );
 * getMimeType( { URL: 'https://wordpress.com/example.gif' } );
 * getMimeType( { mime_type: 'image/gif' } );
 * // All examples return 'image/gif'
 *
 * @param  {(string|window.File|object)} media Media object or string
 * @returns {string}                     Mime type of the media, if known
 */
export function getMimeType( media ) {
	if ( ! media ) {
		return;
	}

	if ( media.mime_type ) {
		return media.mime_type;
	} else if ( 'File' in window && media instanceof window.File ) {
		return media.type;
	}

	let extension = getFileExtension( media );

	if ( ! extension ) {
		return;
	}

	extension = extension.toLowerCase();
	if ( MimeTypes.hasOwnProperty( extension ) ) {
		return MimeTypes[ extension ];
	}
}
