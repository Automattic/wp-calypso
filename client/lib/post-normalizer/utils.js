/** @format */
/**
 * External Dependencies
 */
import { find, forEach, has, some, endsWith, findIndex } from 'lodash';
import url from 'url';

/**
 * Internal Dependencies
 */
import safeImageURL from 'lib/safe-image-url';

const IMAGE_SCALE_FACTOR =
	typeof window !== 'undefined' && window.devicePixelRatio && window.devicePixelRatio > 1 ? 2 : 1;

const DEFAULT_PHOTON_QUALITY = 80; // 80 was chosen after some heuristic testing as the best blend of size and quality

export function isPhotonHost( hostname ) {
	return /^i[0-2]\.wp\.com$/.test( hostname );
}

export function imageSizeFromAttachments( post, imageUrl ) {
	if ( ! post.attachments ) {
		return;
	}

	const found = find( post.attachments, function( attachment ) {
		return attachment.URL === imageUrl;
	} );

	if ( found ) {
		return {
			width: found.width,
			height: found.height,
		};
	}
}

export function maxWidthPhotonishURL( imageURL, width ) {
	if ( ! imageURL ) {
		return imageURL;
	}

	let parsedURL = {};
	try {
		parsedURL = url.parse( imageURL, true, true ); // true, true means allow protocol-less hosts and parse the querystring
	} catch ( e ) {
		/**
		 * `url.parse` throws in a few places where it calls decodeURIComponent
		 * @see e.g. https://github.com/Automattic/wp-calypso/issues/18645
		 */
	}

	if ( ! parsedURL.host ) {
		return imageURL;
	}

	const isGravatar = parsedURL.host.indexOf( 'gravatar.com' ) !== -1;

	delete parsedURL.search;
	// strip other sizing params
	forEach( [ 'h', 'crop', 'resize', 'fit' ], function( param ) {
		delete parsedURL.query[ param ];
	} );

	const sizeParam = isGravatar ? 's' : 'w';
	parsedURL.query[ sizeParam ] = width * IMAGE_SCALE_FACTOR;

	if ( ! isGravatar ) {
		// gravatar doesn't support these, only photon / files.wordpress
		parsedURL.query.quality = DEFAULT_PHOTON_QUALITY;
		parsedURL.query.strip = 'info'; // strip all exif data, leave ICC intact
	}

	// make a new query object with keys in a known order
	parsedURL.query = Object.keys( parsedURL.query )
		.sort()
		.reduce( ( memo, key ) => {
			memo[ key ] = parsedURL.query[ key ];
			return memo;
		}, {} );

	return url.format( parsedURL );
}

export function makeImageURLSafe( object, propName, maxWidth, baseURL ) {
	if ( object && object[ propName ] ) {
		if ( baseURL && ! url.parse( object[ propName ], true, true ).hostname ) {
			object[ propName ] = url.resolve( baseURL, object[ propName ] );
		}
		object[ propName ] = safeImageURL( object[ propName ] );

		if ( maxWidth ) {
			object[ propName ] = maxWidthPhotonishURL( object[ propName ], maxWidth );
		}
	}
}

export function domForHtml( html ) {
	if ( typeof DOMParser !== 'undefined' && DOMParser.prototype.parseFromString ) {
		const parser = new DOMParser();
		const parsed = parser.parseFromString( html, 'text/html' );
		if ( has( parsed, 'body' ) ) {
			return parsed.body;
		}
	}

	// DOMParser support is not present or non-standard
	const dom = document.createElement( 'div' );
	dom.innerHTML = html;

	return dom;
}

/** Determine if url is likely pointed to an image
 * @param {string} uri - a url
 * @returns {boolean} - true or false depending on if it is probably an image (has the right extension)
 */
export function isUrlLikelyAnImage( uri ) {
	if ( ! uri ) {
		return false;
	}

	const withoutQuery = url.parse( uri ).pathname;
	return some( [ '.jpg', '.jpeg', '.png', '.gif' ], ext => endsWith( withoutQuery, ext ) );
}

/**
 * Determine if a post thumbnail is likely an image
 * @param  {object} thumb the thumbnail object from a post
 * @return {boolean}       whether or not we think this is an image
 */
export function thumbIsLikelyImage( thumb ) {
	if ( ! thumb || ! thumb.URL ) {
		return false;
	}
	// this doesn't work because jetpack 4.2 lies
	// normally I wouldn't leave commented code in, but it's the best way to explain what not to do
	//if ( startsWith( thumb.mime_type, 'image/' ) ) {
	//	return true;
	// }
	return isUrlLikelyAnImage( thumb.URL );
}

/**
 * Determines if an iframe is from a source we trust.  We allow these to be the featured media and also give
 * them a free-er sandbox
 * @param  {object} iframe the iframe to check
 * @return {bool} true if whitelisted
 */
export function iframeIsWhitelisted( iframe ) {
	const iframeWhitelist = [
		'youtube.com',
		'youtube-nocookie.com',
		'videopress.com',
		'vimeo.com',
		'cloudup.com',
		'soundcloud.com',
		'8tracks.com',
		'spotify.com',
		'me.sh',
		'bandcamp.com',
		'kickstarter.com',
		'facebook.com',
		'embed.itunes.apple.com',
		'nyt.com',
		'google.com',
		'mixcloud.com',
		'players.brightcove.net',
		'embed.ted.com',
		'fast.wistia.net',
		'player.twitch.tv',
		'archive.org',
		'codepen.io',
		'www.audiomack.com',
		'player.theplatform.com',
		'embed.radiopublic.com',
		'gfycat.com',
		'scribd.com',
	];
	const hostName = iframe.src && url.parse( iframe.src ).hostname;
	const iframeSrc = hostName && hostName.toLowerCase();
	return some( iframeWhitelist, function( whitelistedSuffix ) {
		return endsWith( '.' + iframeSrc, '.' + whitelistedSuffix );
	} );
}

export function isCandidateForCanonicalImage( image ) {
	if ( ! image ) {
		return false;
	}

	if ( image.width < 100 ) {
		return false;
	}

	if ( image.width * image.height < 100 * 75 ) {
		return false;
	}
	return true;
}

function getPathname( uri ) {
	const parsedUrl = url.parse( uri );
	const path = parsedUrl.pathname;
	if ( isPhotonHost( parsedUrl.hostname ) ) {
		return path.substring( path.indexOf( '/', 1 ) );
	}
	return path;
}

/** returns whether or not a posts featuredImages is contained within the contents
 *
 * @param {Object} post - the post to check
 * @returns {Boolean|Number} false if featuredImage is not within content content_images.
 *   otherwise returns the index of the dupe in post.images.
 */
export function isFeaturedImageInContent( post ) {
	if ( thumbIsLikelyImage( post.post_thumbnail ) ) {
		const featuredImagePath = getPathname( post.post_thumbnail.URL );

		const indexOfContentImage = findIndex(
			post.images,
			img => getPathname( img.src ) === featuredImagePath,
			1
		); // skip first element in post.images because it is always the featuredImage

		if ( indexOfContentImage > 0 ) {
			return indexOfContentImage;
		}
	}

	return false;
}

export function deduceImageWidthAndHeight( image ) {
	if ( image.height && image.width ) {
		return {
			height: image.height,
			width: image.width,
		};
	}
	if ( image.naturalHeight && image.natualWidth ) {
		return {
			height: image.naturalHeight,
			width: image.naturalWidth,
		};
	}
	if ( image.dataset && image.dataset.origSize ) {
		const [ width, height ] = image.dataset.origSize.split( ',' ).map( Number );
		return {
			width,
			height,
		};
	}
	return null;
}

export const safeLinkRe = /^https?:\/\//;

/**
 * Only accept links that start with http or https. Reject others.
 *
 * @param {String} link the link to check
 * @returns {String|undefined} the safe link or undefined
 */
export function safeLink( link ) {
	if ( safeLinkRe.test( link ) ) {
		return link;
	}
	return undefined;
}
