/**
 * External dependencies
 */
import path from 'path';

/**
 * Internal dependencies
 */
import { getFileExtension } from 'calypso/lib/media/utils/get-file-extension';
import { getMimeType } from 'calypso/lib/media/utils/get-mime-type';
import { createTransientMediaId } from 'calypso/lib/media/utils';

/**
 * Returns an object describing a transient media item which can be used in
 * optimistic rendering prior to media persistence to server.
 *
 * @param  {(string|object|window.Blob|window.File)} file URL or File object
 * @returns {object}                         Transient media object
 */
export function createTransientMedia( file ) {
	const transientMedia = {
		transient: true,
		ID: createTransientMediaId(),
	};

	if ( 'string' === typeof file ) {
		// Generate from string
		Object.assign( transientMedia, {
			file: file,
			title: path.basename( file ),
			extension: getFileExtension( file ),
			mime_type: getMimeType( file ),
		} );
	} else if ( file.thumbnails ) {
		// Generate from a file data object
		Object.assign( transientMedia, {
			file: file.URL,
			title: file.name,
			caption: file.caption || '',
			extension: file.extension,
			mime_type: file.mime_type,
			guid: file.URL,
			URL: file.URL,
			external: true,
		} );
	} else {
		// Handle the case where a an object has been passed that wraps a
		// Blob and contains a fileName
		const fileContents = file.fileContents || file;
		const fileName = file.fileName || file.name;

		// Generate from window.File object
		const fileUrl = window.URL.createObjectURL( fileContents );

		Object.assign( transientMedia, {
			URL: fileUrl,
			guid: fileUrl,
			file: fileName,
			title: file.title || path.basename( fileName ),
			extension: getFileExtension( file.fileName || fileContents ),
			mime_type: getMimeType( file.fileName || fileContents ),
			// Size is not an API media property, though can be useful for
			// validation purposes if known
			size: fileContents.size,
		} );
	}

	return transientMedia;
}
