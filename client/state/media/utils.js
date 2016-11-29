/**
 * External dependencies
 */
import { basename } from 'path';
import { uniqueId } from 'lodash';

/**
 * Internal dependencies
 */
import { getFileExtension, getMimeType } from 'lib/media/utils';

/**
 * One year in milliseconds. Used in offseting the date of a transient so that
 * when uploading multiple files, the first file doesn't suddenly become newest
 * in the set once it finishes uploading. The duration is arbitrary, but one
 * would hope that it would never take a year to upload a file.
 *
 * @type {Number}
 */
const ONE_YEAR_IN_MILLISECONDS = 31540000000;

/**
 * Regular expression matching transient media object IDs.
 *
 * @type {RegExp}
 */
const REGEXP_TRANSIENT_MEDIA_ID = /^media\d+$/;

/**
 * Given a file, returns a transient media object. A transient media object
 * mimics the shape of a media item returned by the REST API, to be used in
 * optimistic usage of the media prior to upload completion.
 *
 * @param  {(String|File)} file URL or File object
 * @return {Object}             Transient media object
 */
export function createTransientMedia( file ) {
	// If already formatted as transient, return verbatim
	if ( isTransientMedia( file ) ) {
		return file;
	}

	const media = {
		ID: uniqueId( 'media' ),
		date: new Date( Date.now() + ONE_YEAR_IN_MILLISECONDS ).toISOString()
	};

	if ( 'string' === typeof file ) {
		// Generate from string URL
		return Object.assign( media, {
			file: file,
			title: basename( file ),
			extension: getFileExtension( file ),
			mime_type: getMimeType( file )
		} );
	}

	// Generate from window.File object
	const fileUrl = window.URL.createObjectURL( file );

	return Object.assign( media, {
		URL: fileUrl,
		guid: fileUrl,
		file: file.name,
		title: basename( file.name ),
		extension: getFileExtension( file ),
		mime_type: getMimeType( file ),
		// Size is not an API media property, though can be useful for
		// validation purposes if known
		size: file.size
	} );
}

/**
 * Given a media object, returns true if the object is a transient media
 * object, or false otherwise.
 *
 * @param  {Object}  media Media object to test
 * @return {Boolean}       Whether media object is transient
 */
export function isTransientMedia( media ) {
	return !! media && REGEXP_TRANSIENT_MEDIA_ID.test( media.ID );
}
