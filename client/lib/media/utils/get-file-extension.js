/**
 * External dependencies
 */
import path from 'path';
import { isUri } from 'valid-url';

/**
 * Internal dependencies
 */
import { getUrlParts } from 'calypso/lib/url';

/**
 * Given a media string, File, or object, returns the file extension.
 *
 * @example
 * getFileExtension( 'example.gif' );
 * getFileExtension( { URL: 'https://wordpress.com/example.gif' } );
 * getFileExtension( new window.File( [''], 'example.gif' ) );
 * // All examples return 'gif'
 *
 * @param  {(string|window.File|object)} media Media object or string
 * @returns {string}                     File extension
 */
export function getFileExtension( media ) {
	let extension;

	if ( ! media ) {
		return;
	}

	const isString = 'string' === typeof media;
	const isFileObject = 'File' in window && media instanceof window.File;

	if ( isString ) {
		let filePath;
		if ( isUri( media ) ) {
			filePath = getUrlParts( media ).pathname;
		} else {
			filePath = media;
		}

		extension = path.extname( filePath ).slice( 1 );
	} else if ( isFileObject ) {
		extension = path.extname( media.name ).slice( 1 );
	} else if ( media.extension ) {
		extension = media.extension;
	} else {
		const pathname = getUrlParts( media.URL || media.file || media.guid || '' ).pathname || '';
		extension = path.extname( pathname ).slice( 1 );
	}

	return extension;
}
