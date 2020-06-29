/**
 * Internal dependencies
 */
import { uploadMedia, uploadSingleMedia } from './upload-media';
import { getFileUploader } from 'lib/media/utils';

/**
 * Upload a single media item
 *
 * @param {object} site The site for which to upload the file(s)
 * @param {object|object[]} file The file or files to upload
 */
export const addMedia = ( site, file ) => ( dispatch ) => {
	const uploader = getFileUploader();

	const action = Array.isArray( file ) ? uploadMedia : uploadSingleMedia;

	return dispatch( action( file, site, uploader ) );
};
