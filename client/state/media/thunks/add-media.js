import { getFileUploader } from 'calypso/lib/media/utils';
import { uploadMedia } from './upload-media';

/**
 * Upload a single media item
 *
 * @param {object|object[]} file The file or files to upload
 * @param {object} site The site for which to upload the file(s)
 * @param {number} postId - ID of the post to attach the media item to
 */
export const addMedia = ( file, site, postId = 0 ) => ( dispatch ) => {
	return dispatch( uploadMedia( file, site, postId, getFileUploader ) );
};
