/**
 * Internal dependencies
 */
import { uploadMedia } from './upload-media';
import wpcom from 'lib/wp';

const getExternalUploader = ( service ) => ( file, siteId ) => {
	return wpcom.undocumented().site( siteId ).uploadExternalMedia( service, [ file.guid ] );
};

/**
 * Add a single external media file.
 *
 * @param {object} site The site for which to upload the media
 * @param {object} file The media file to upload
 * @param {object} service The external media service used
 * @param {string?} transientDate Transient date to use for the file being uploaded
 */
export const addExternalMedia = ( site, file, service, transientDate = undefined ) => (
	dispatch
) => {
	const uploader = getExternalUploader( service );

	return dispatch( uploadMedia( site, file, uploader, transientDate ) );
};
