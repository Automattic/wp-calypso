/**
 * Internal dependencies
 */
import { uploadMedia } from './upload-media';
import { getFileUploader } from 'lib/media/utils';

/**
 * Upload a single media item
 *
 * @param {object} site The site for which to upload the file
 * @param {object} file The file to upload
 * @param {string?} transientDate Transient date to use for the file
 */
export const addMedia = ( site, file, transientDate = undefined ) => ( dispatch, getState ) => {
	const uploader = getFileUploader( getState(), site, file );
	return dispatch( uploadMedia( site, file, uploader, transientDate ) );
};
