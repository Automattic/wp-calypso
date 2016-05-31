/**
 * External dependencies
 */
import url from 'url';
import path from 'path';
import photon from 'photon';
import includes from 'lodash/includes';
import omitBy from 'lodash/omitBy';
import { isUri } from 'valid-url';

/**
 * Internal dependencies
 */
import resize from 'lib/resize-image-url';
import {
	MimeTypes,
	VideoPressFileTypes,
	ThumbnailSizeDimensions,
	GalleryColumnedTypes,
	GallerySizeableTypes,
	GalleryDefaultAttrs
} from './constants';
import Shortcode from 'lib/shortcode';

/**
 * Module variables
 */
const REGEXP_VIDEOPRESS_GUID = /^[a-z\d]+$/i;

const MediaUtils = {
	/**
	 * Given a media object, returns a URL string to that media. Accepts
	 * optional options to specify photon usage or a maximum image width.
	 *
	 * @param  {Object} media   Media object
	 * @param  {Object} options Optional options, accepting a `photon` boolean,
	 *                          `maxWidth` pixel value, or `size`.
	 * @return {string}         URL to the media
	 */
	url: function( media, options ) {
		if ( media.transient ) {
			return media.URL;
		}

		// We've found that some media can be corrupt with an unusable URL.
		// Return early so attempts to parse the URL don't result in an error.
		if ( ! media.URL ) {
			return;
		}

		options = options || {};

		if ( options.photon ) {
			if ( options.maxWidth ) {
				return photon( media.URL, { width: options.maxWidth } );
			}

			return photon( media.URL );
		}

		if ( media.thumbnails && options.size in media.thumbnails ) {
			return media.thumbnails[ options.size ];
		}

		if ( options.maxWidth ) {
			return resize( media.URL, {
				w: options.maxWidth
			} );
		}

		return media.URL;
	},

	/**
	 * Given a media string, File, or object, returns the file extension.
	 *
	 * @example
	 * getFileExtension( 'example.gif' );
	 * getFileExtension( { URL: 'https://wordpress.com/example.gif' } );
	 * getFileExtension( new window.File( [''], 'example.gif' ) );
	 * // All examples return 'gif'
	 *
	 * @param  {(string|File|Object)} media Media object or string
	 * @return {string}                     File extension
	 */
	getFileExtension: function( media ) {
		let extension;

		if ( ! media ) {
			return;
		}

		const isString = 'string' === typeof media;
		const isFileObject = 'File' in window && media instanceof window.File;

		if ( isString ) {
			let filePath;
			if ( isUri( media ) ) {
				filePath = url.parse( media ).pathname;
			} else {
				filePath = media;
			}

			extension = path.extname( filePath ).slice( 1 );
		} else if ( isFileObject ) {
			extension = path.extname( media.name ).slice( 1 );
		} else if ( media.extension ) {
			extension = media.extension;
		} else {
			extension = path.extname( url.parse( media.URL || media.file || media.guid || '' ).pathname ).slice( 1 );
		}

		return extension;
	},

	/**
	 * Given a media string or object, returns the MIME type prefix.
	 *
	 * @example
	 * getMimeType( 'example.gif' );
	 * getMimeType( { URL: 'https://wordpress.com/example.gif' } );
	 * getMimeType( { mime_type: 'image/gif' } );
	 * // All examples return 'image'
	 *
	 * @param  {string} media Media object or mime type string
	 * @return {string}       The MIME type prefix
	 */
	getMimePrefix: function( media ) {
		var mimeType = MediaUtils.getMimeType( media ),
			mimePrefixMatch;

		if ( ! mimeType ) {
			return;
		}

		mimePrefixMatch = mimeType.match( /^([^\/]+)\// );

		if ( mimePrefixMatch ) {
			return mimePrefixMatch[1];
		}
	},

	/**
	 * Given a media string, File, or object, returns the MIME type if one can
	 * be determined.
	 *
	 * @example
	 * getMimeType( 'example.gif' );
	 * getMimeType( { URL: 'https://wordpress.com/example.gif' } );
	 * getMimeType( { mime_type: 'image/gif' } );
	 * // All examples return 'image/gif'
	 *
	 * @param  {(string|File|Object)} media Media object or string
	 * @return {string}                     Mime type of the media, if known
	 */
	getMimeType: function( media ) {
		if ( ! media ) {
			return;
		}

		if ( media.mime_type ) {
			return media.mime_type;
		} else if ( 'File' in window && media instanceof window.File ) {
			return media.type;
		}

		let extension = MediaUtils.getFileExtension( media );

		if ( ! extension ) {
			return;
		}

		extension = extension.toLowerCase();
		if ( MimeTypes.hasOwnProperty( extension ) ) {
			return MimeTypes[ extension ];
		}
	},

	/**
	 * Given an array of media objects, returns a filtered array composed of
	 * items from the original array matching the specified mime prefix.
	 *
	 * @param  {Array}  items      Array of media objects
	 * @param  {string} mimePrefix A mime prefix, e.g. "image"
	 * @return {Array}             Filtered array of matching media objects
	 */
	filterItemsByMimePrefix: function( items, mimePrefix ) {
		return items.filter( function( item ) {
			return MediaUtils.getMimePrefix( item ) === mimePrefix;
		} );
	},

	/**
	 * Given an array of media objects, returns a copy sorted by media date.
	 *
	 * @param  {Array} items Array of media objects
	 * @return {Array}       Sorted array of media objects
	 */
	sortItemsByDate: function( items ) {
		var copy = items.slice( 0 );

		copy.sort( function( a, b ) {
			var dateCompare;

			if ( a.date && b.date ) {
				dateCompare = Date.parse( b.date ) - Date.parse( a.date );

				// We only return the result of a date comaprison if item dates
				// are set and the dates are not equal...
				if ( 0 !== dateCompare ) {
					return dateCompare;
				}
			}

			// ...otherwise, we return the greater of the two item IDs
			return b.ID - a.ID;
		} );

		return copy;
	},

	/**
	 * Returns true if the site can be trusted to accurately report its allowed
	 * file types. Returns false otherwise.
	 *
	 * Jetpack versions 3.8.0 and earlier do not sync the allowed file types
	 * option, so we must assume that all file types are supported.
	 *
	 * @param  {Object}  site Site object
	 * @return {Boolean}      Site allowed file types are accurate
	 */
	isSiteAllowedFileTypesToBeTrusted: function( site ) {
		return ! site || ! site.jetpack || site.versionCompare( '3.8.1', '>=' );
	},

	/**
	 * Returns an array of supported file extensions for the specified site.
	 *
	 * @param  {Object} site Site object
	 * @return {Array}      Supported file extensions
	 */
	getAllowedFileTypesForSite: function( site ) {
		if ( ! site ) {
			return [];
		}

		return site.options.allowed_file_types;
	},

	/**
	 * Returns true if the specified item is a valid file in a Premium plan,
	 * or false otherwise.
	 *
	 * @param  {Object}  item Media object
	 * @param  {Object}  site Site object
	 * @return {Boolean}      Whether the Premium plan supports the item
	 */
	isSupportedFileTypeInPremium: function( item, site ) {
		if ( ! site || ! item ) {
			return false;
		}

		if ( ! MediaUtils.isSiteAllowedFileTypesToBeTrusted( site ) ) {
			return true;
		}

		return VideoPressFileTypes.some( function( allowed ) {
			return allowed.toLowerCase() === item.extension.toLowerCase();
		} );
	},

	/**
	 * Returns true if the specified item is a valid file for the given site,
	 * or false otherwise. A file is valid if the sites allowable file types
	 * contains the item's type.
	 *
	 * @param  {Object}  item Media object
	 * @param  {Object}  site Site object
	 * @return {Boolean}      Whether the site supports the item
	 */
	isSupportedFileTypeForSite: function( item, site ) {
		if ( ! site || ! item ) {
			return false;
		}

		if ( ! MediaUtils.isSiteAllowedFileTypesToBeTrusted( site ) ) {
			return true;
		}

		return MediaUtils.getAllowedFileTypesForSite( site ).some( function( allowed ) {
			return allowed.toLowerCase() === item.extension.toLowerCase();
		} );
	},

	/**
	 * Returns true if the specified item exceeds the maximum upload size for
	 * the given site. Returns null if the bytes are invalid or the max upload
	 * size for the site is unknown. Otherwise, returns true.
	 *
	 * @param  {Number}   bytes A file size to check, as bytes
	 * @param  {Object}   site  Site object
	 * @return {?Boolean}       Whether the size exceeds the site maximum
	 */
	isExceedingSiteMaxUploadSize: function( bytes, site ) {
		if ( ! isFinite( bytes ) || ! site || ! site.options || ! site.options.max_upload_size ) {
			return null;
		}

		return bytes > site.options.max_upload_size;
	},

	/**
	 * Returns true if the provided media object is a VideoPress video item.
	 *
	 * @param  {Object}  item Media object
	 * @return {Boolean}      Whether the media is a VideoPress video item
	 */
	isVideoPressItem: function( item ) {
		if ( ! item || ! item.videopress_guid ) {
			return false;
		}

		return REGEXP_VIDEOPRESS_GUID.test( item.videopress_guid );
	},

	/**
	 * Returns a human-readable string representing the specified seconds
	 * duration.
	 *
	 * @example
	 * MediaUtils.playtime( 7 ); // -> "0:07"
	 *
	 * @param  {number} duration Duration in seconds
	 * @return {string}          Human-readable duration
	 */
	playtime: function( duration ) {
		if ( isNaN( duration ) ) {
			return;
		}

		const hours = Math.floor( duration / 3600 ),
			minutes = Math.floor( duration / 60 ) % 60,
			seconds = Math.floor( duration ) % 60;

		let playtime = [ minutes, seconds ].map( function( value ) {
			return ( '0' + value ).slice( -2 );
		} ).join( ':' );

		if ( hours ) {
			playtime = [ hours, playtime ].join( ':' );
		}

		playtime = playtime.replace( /^(00:)+/g, '' );

		if ( -1 === playtime.indexOf( ':' ) ) {
			playtime = '0:' + playtime;
		}

		return playtime.replace( /^0(\d)(.*)/, '$1$2' );
	},

	/**
	 * Returns an object containing width and height dimenions in pixels for
	 * the thumbnail size, optionally for a given site. If the size cannot be
	 * determined or a site is not passed, a fallback default value is used.
	 *
	 * @param  {String} size Thumbnail size
	 * @param  {Object} site Site object
	 * @return {Object}      Width and height dimensions
	 */
	getThumbnailSizeDimensions: function( size, site ) {
		var width, height;

		if ( site && site.options ) {
			width = site.options[ 'image_' + size + '_width' ];
			height = site.options[ 'image_' + size + '_height' ];
		}

		if ( size in ThumbnailSizeDimensions ) {
			width = width || ThumbnailSizeDimensions[ size ].width;
			height = height || ThumbnailSizeDimensions[ size ].height;
		}

		return { width, height };
	},

	/**
	 * Given an array of media items, returns a gallery shortcode using an
	 * optional set of parameters.
	 *
	 * @param  {Object} settings Gallery settings
	 * @return {String}          Gallery shortcode
	 */
	generateGalleryShortcode: function( settings ) {
		var attrs;

		if ( ! settings.items.length ) {
			return;
		}

		// gallery images are passed in as an array of objects
		// in settings.items but we just need the IDs set to attrs.ids
		attrs = Object.assign( {
			ids: settings.items.map( ( item ) => item.ID ).join()
		}, settings );

		delete attrs.items;

		if ( ! includes( GalleryColumnedTypes, attrs.type ) ) {
			delete attrs.columns;
		}

		if ( ! includes( GallerySizeableTypes, attrs.type ) ) {
			delete attrs.size;
		}

		attrs = omitBy( attrs, function( value, key ) {
			return GalleryDefaultAttrs[ key ] === value;
		} );

		// WordPress expects all lowercase
		if ( attrs.orderBy ) {
			attrs.orderby = attrs.orderBy;
			delete attrs.orderBy;
		}

		return Shortcode.stringify( {
			tag: 'gallery',
			type: 'single',
			attrs: attrs
		} );
	},

	/**
	 * Returns true if the specified user is capable of deleting the media
	 * item, or false otherwise.
	 *
	 * @param  {Object}  item Media item
	 * @param  {Object}  user User object
	 * @param  {Object}  site Site object
	 * @return {Boolean}      Whether user can delete item
	 */
	canUserDeleteItem( item, user, site ) {
		if ( user.ID === item.author_ID ) {
			return site.capabilities.delete_posts;
		}

		return site.capabilities.delete_others_posts;
	},

	/**
	 * Wrapper method for the HTML canvas toBlob() function. Polyfills if the
	 * function does not exist
	 *
	 * @param {Object} canvas the canvas element
	 * @param {Function} callback function to process the blob after it is extracted
	 * @param {String} type image type to be extracted
	 * @param {Number} quality extracted image quality
	 */
	canvasToBlob( canvas, callback, type, quality ) {
		if ( ! HTMLCanvasElement.prototype.toBlob ) {
			Object.defineProperty( HTMLCanvasElement.prototype, 'toBlob', {
				value: function( polyfillCallback, polyfillType, polyfillQuality ) {
					const binStr = atob( this.toDataURL( polyfillType, polyfillQuality ).split( ',' )[1] ),
						len = binStr.length,
						arr = new Uint8Array( len );

					for ( let i = 0; i < len; i++ ) {
						arr[i] = binStr.charCodeAt( i );
					}

					polyfillCallback( new Blob( [arr], {
						type: polyfillType || 'image/png'
					} ) );
				}
			} );
		}

		canvas.toBlob( callback, type, quality );
	}
};

module.exports = MediaUtils;
