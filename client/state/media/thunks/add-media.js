/**
 * Internal dependencies
 */
import { uploadMedia } from './upload-media';
import { getFileUploader } from 'calypso/lib/media/utils';

/**
 * Upload a single media item
 *
 * @param {object|object[]} file The file or files to upload
 * @param {object} site The site for which to upload the file(s)
 */
export const addMedia = ( file, site ) => ( dispatch ) => {
	const uploader = getFileUploader();
	return dispatch( uploadMedia( file, site, uploader ) );
};
