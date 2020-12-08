/**
 * Internal dependencies
 */
import { getMimeType } from 'calypso/lib/media/utils/get-mime-type';

/**
 * Given a media string or object, returns the MIME type prefix.
 *
 * @example
 * getMimeType( 'example.gif' );
 * getMimeType( { URL: 'https://wordpress.com/example.gif' } );
 * getMimeType( { mime_type: 'image/gif' } );
 * // All examples return 'image'
 *
 * @param  {(string|window.File|object)} media Media object or mime type string
 * @returns {string}       The MIME type prefix
 */
export function getMimePrefix( media ) {
	const mimeType = getMimeType( media );

	if ( ! mimeType ) {
		return;
	}

	const mimePrefixMatch = mimeType.match( /^([^/]+)\// );

	if ( mimePrefixMatch ) {
		return mimePrefixMatch[ 1 ];
	}
}
