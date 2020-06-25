/**
 * External dependencies
 */
import debugFactory from 'debug';
const debug = debugFactory( 'calypso:media' );

/**
 * Internal dependencies
 */
import { reduxGetState } from 'lib/redux-bridge';
import wpcom from 'lib/wp';
import { getEditorPostId } from 'state/ui/editor/selectors';

export { url } from 'lib/media/utils/url';
export { getFileExtension } from 'lib/media/utils/get-file-extension';
export { getMimeType } from 'lib/media/utils/get-mime-type';
export { getMimePrefix } from 'lib/media/utils/get-mime-prefix';
export { filterItemsByMimePrefix } from 'lib/media/utils/filter-items-by-mime-prefix';
export { sortItemsByDate } from 'lib/media/utils/sort-items-by-date';
export { isSiteAllowedFileTypesToBeTrusted } from 'lib/media/utils/is-site-allowed-file-types-to-be-trusted';
export { getAllowedFileTypesForSite } from 'lib/media/utils/get-allowed-file-types-for-site';
export { isSupportedFileTypeInPremium } from 'lib/media/utils/is-supported-file-type-in-premium';
export { isSupportedFileTypeForSite } from 'lib/media/utils/is-supported-file-type-for-site';
export { isExceedingSiteMaxUploadSize } from 'lib/media/utils/is-exceeding-site-max-upload-size';
export { isVideoPressItem } from 'lib/media/utils/is-videopress-item';
export { playtime } from 'lib/media/utils/playtime';
export { getThumbnailSizeDimensions } from 'lib/media/utils/get-thumbnail-size-dimensions';
export { generateGalleryShortcode } from 'lib/media/utils/generate-gallery-shortcode';
export { canUserDeleteItem } from 'lib/media/utils/can-user-delete-item';
export { canvasToBlob } from 'lib/media/utils/canvas-to-blob';
export { isItemBeingUploaded } from 'lib/media/utils/is-item-being-uploaded';
export { isTransientPreviewable } from 'lib/media/utils/is-transient-previewable';
export { createTransientMedia } from 'lib/media/utils/create-transient-media';
export { validateMediaItem } from 'lib/media/utils/validate-media-item';
export { mediaURLToProxyConfig } from 'lib/media/utils/media-url-to-proxy-config';

export const getFileUploader = () => ( file, siteId ) => {
	// Determine upload mechanism by object type
	const isUrl = 'string' === typeof file;

	// Assign parent ID if currently editing post
	const postId = getEditorPostId( reduxGetState() );
	const title = file.title;
	if ( postId ) {
		file = {
			parent_id: postId,
			[ isUrl ? 'url' : 'file' ]: file,
		};
	} else if ( file.fileContents ) {
		//if there's no parent_id, but the file object is wrapping a Blob
		//(contains fileContents, fileName etc) still wrap it in a new object
		file = {
			file: file,
		};
	}

	if ( title ) {
		file.title = title;
	}

	debug( 'Uploading media to %d from %o', siteId, file );

	if ( isUrl ) {
		return wpcom.site( siteId ).addMediaUrls( {}, file );
	}

	return wpcom.site( siteId ).addMediaFiles( {}, file );
};
