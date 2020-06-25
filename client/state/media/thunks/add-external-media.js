/**
 * Internal dependencies
 */
import { uploadMedia, uploadSingleMedia } from './upload-media';
import wpcom from 'lib/wp';

const getExternalUploader = ( service ) => ( file, siteId ) => {
	return wpcom.undocumented().site( siteId ).uploadExternalMedia( service, [ file.guid ] );
};

/**
 * Add a single external media file.
 *
 * @param {object} site The site for which to upload the file(s)
 * @param {object|object[]} file The media file or files to upload
 * @param {object} service The external media service used
 */
export const addExternalMedia = ( site, file, service ) => ( dispatch ) => {
	const uploader = getExternalUploader( service );

	const action = Array.isArray( file ) ? uploadMedia : uploadSingleMedia;

	return dispatch( action( file, site, uploader ) );
};
