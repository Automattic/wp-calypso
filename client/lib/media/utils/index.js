/**
 * External dependencies
 */
import path from 'path';
import { includes, omitBy } from 'lodash';
import debugFactory from 'debug';
const debug = debugFactory( 'calypso:media' );

/**
 * Internal dependencies
 */
import { reduxGetState } from 'lib/redux-bridge';
import {
	GalleryColumnedTypes,
	GallerySizeableTypes,
	GalleryDefaultAttrs,
	ValidationErrors as MediaValidationErrors,
} from 'lib/media/constants';
import { stringify } from 'lib/shortcode';
import impureLodash from 'lib/impure-lodash';
import { getUrlParts } from 'lib/url';
import wpcom from 'lib/wp';
import { getEditorPostId } from 'state/ui/editor/selectors';

import { getFileExtension } from 'lib/media/utils/get-file-extension';
import { getMimeType } from 'lib/media/utils/get-mime-type';
import { isSupportedFileTypeInPremium } from 'lib/media/utils/is-supported-file-type-in-premium';
import { isSupportedFileTypeForSite } from 'lib/media/utils/is-supported-file-type-for-site';
import { isExceedingSiteMaxUploadSize } from 'lib/media/utils/is-exceeding-site-max-upload-size';

const { uniqueId } = impureLodash;

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

/**
 * Given an array of media items, returns a gallery shortcode using an
 * optional set of parameters.
 *
 * @param  {object} settings Gallery settings
 * @returns {string}          Gallery shortcode
 */
export function generateGalleryShortcode( settings ) {
	let attrs;

	if ( ! settings.items.length ) {
		return;
	}

	// gallery images are passed in as an array of objects
	// in settings.items but we just need the IDs set to attrs.ids
	attrs = Object.assign(
		{
			ids: settings.items.map( ( item ) => item.ID ).join(),
		},
		settings
	);

	delete attrs.items;

	if ( ! includes( GalleryColumnedTypes, attrs.type ) ) {
		delete attrs.columns;
	}

	if ( ! includes( GallerySizeableTypes, attrs.type ) ) {
		delete attrs.size;
	}

	attrs = omitBy( attrs, function ( value, key ) {
		return GalleryDefaultAttrs[ key ] === value;
	} );

	// WordPress expects all lowercase
	if ( attrs.orderBy ) {
		attrs.orderby = attrs.orderBy;
		delete attrs.orderBy;
	}

	return stringify( {
		tag: 'gallery',
		type: 'single',
		attrs: attrs,
	} );
}

/**
 * Returns true if the specified user is capable of deleting the media
 * item, or false otherwise.
 *
 * @param  {object}  item Media item
 * @param  {object}  user User object
 * @param  {object}  site Site object
 * @returns {boolean}      Whether user can delete item
 */
export function canUserDeleteItem( item, user, site ) {
	if ( user.ID === item.author_ID ) {
		return site.capabilities.delete_posts;
	}

	return site.capabilities.delete_others_posts;
}

/**
 * Wrapper method for the HTML canvas toBlob() function. Polyfills if the
 * function does not exist
 *
 * @param {object} canvas the canvas element
 * @param {Function} callback function to process the blob after it is extracted
 * @param {string} type image type to be extracted
 * @param {number} quality extracted image quality
 */
export function canvasToBlob( canvas, callback, type, quality ) {
	const { HTMLCanvasElement, Blob, atob } = window;

	if ( ! HTMLCanvasElement.prototype.toBlob ) {
		Object.defineProperty( HTMLCanvasElement.prototype, 'toBlob', {
			value: function ( polyfillCallback, polyfillType, polyfillQuality ) {
				const binStr = atob( this.toDataURL( polyfillType, polyfillQuality ).split( ',' )[ 1 ] ),
					len = binStr.length,
					arr = new Uint8Array( len );

				for ( let i = 0; i < len; i++ ) {
					arr[ i ] = binStr.charCodeAt( i );
				}

				polyfillCallback(
					new Blob( [ arr ], {
						type: polyfillType || 'image/png',
					} )
				);
			},
		} );
	}

	canvas.toBlob( callback, type, quality );
}

/**
 * Returns true if specified item is currently being uploaded (i.e. is transient).
 *
 * @param  {object}  item Media item
 * @returns {boolean}      Whether item is being uploaded
 */
export function isItemBeingUploaded( item ) {
	if ( ! item ) {
		return null;
	}

	return !! item.transient;
}

export function isTransientPreviewable( item ) {
	return !! ( item && item.URL );
}

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
		ID: uniqueId( 'media-' ),
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

/**
 * Validates a media item for a site, and returns validation errors (if any).
 *
 * @param  {object}      site Site object
 * @param  {object}      item Media item
 * @returns {Array|null}      Validation errors, or null if no site.
 */
export function validateMediaItem( site, item ) {
	const itemErrors = [];

	if ( ! site ) {
		return;
	}

	if ( ! isSupportedFileTypeForSite( item, site ) ) {
		if ( isSupportedFileTypeInPremium( item, site ) ) {
			itemErrors.push( MediaValidationErrors.FILE_TYPE_NOT_IN_PLAN );
		} else {
			itemErrors.push( MediaValidationErrors.FILE_TYPE_UNSUPPORTED );
		}
	}

	if ( true === isExceedingSiteMaxUploadSize( item, site ) ) {
		itemErrors.push( MediaValidationErrors.EXCEEDS_MAX_UPLOAD_SIZE );
	}

	return itemErrors;
}

/**
 * Given a media file URL (possibly served through photon) and site slug, returns information
 * required to correctly proxy the asset through the media proxy. Specifically, it returns
 * an object with the following keys:
 * - query: query string extracted from url
 * - filePath: path of the file on remote site, even if url is photon url
 * - isRelativeToSiteRoot: true if the file come from remote site identified by siteSlug, false otherwise
 *
 * @param {string} mediaUrl Media file URL.
 * @param {string} siteSlug Slug of the site this file belongs to.
 * @returns {object}	Dictionary
 */
export function mediaURLToProxyConfig( mediaUrl, siteSlug ) {
	const { pathname, search: query, protocol, hostname } = getUrlParts( mediaUrl );
	let filePath = pathname;
	let isRelativeToSiteRoot = true;

	if ( [ 'http:', 'https:' ].indexOf( protocol ) === -1 ) {
		isRelativeToSiteRoot = false;
	} else if ( hostname !== siteSlug ) {
		isRelativeToSiteRoot = false;
		// CDN URLs like i0.wp.com/mysite.com/media.jpg should also be considered relative to mysite.com
		if ( /^i[0-2]\.wp\.com$/.test( hostname ) ) {
			const [ first, ...rest ] = filePath.substr( 1 ).split( '/' );
			filePath = '/' + rest.join( '/' );

			if ( first === siteSlug ) {
				isRelativeToSiteRoot = true;
			}
		}
	}

	return {
		query,
		filePath,
		isRelativeToSiteRoot,
	};
}

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
