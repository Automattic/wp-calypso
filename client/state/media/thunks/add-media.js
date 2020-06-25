/**
 * Internal dependencies
 */
import { uploadMedia } from './upload-media';
import { getFileUploader } from 'lib/media/utils';

/**
 * Upload a single media item
 *
 * @param {object} site The site for which to upload the file(s)
 * @param {object|object[]} file The file or files to upload
 */
export const addMedia = ( site, file ) => ( dispatch, getState ) => {
	const uploader = getFileUploader( getState(), site, file );
	return dispatch( uploadMedia( file, site, uploader ) );
};
