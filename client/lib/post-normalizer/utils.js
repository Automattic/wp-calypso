/**
 * External Dependencies
 */
import { find, forEach, some, endsWith } from 'lodash';
import url from 'url';

/**
 * Internal Dependencies
 */
import safeImageURL from 'lib/safe-image-url';

const IMAGE_SCALE_FACTOR = ( typeof window !== 'undefined' && window.devicePixelRatio && window.devicePixelRatio > 1 ) ? 2 : 1;

const DEFAULT_PHOTON_QUALITY = 80; // 80 was chosen after some heuristic testing as the best blend of size and quality

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
			height: found.height
		};
	}
}

export function maxWidthPhotonishURL( imageURL, width ) {
	if ( ! imageURL ) {
		return imageURL;
	}

	const parsedURL = url.parse( imageURL, true, true ); // true, true means allow protocol-less hosts and parse the querystring

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
	let dom;
	if ( typeof DOMParser !== 'undefined' && DOMParser.prototype.parseFromString ) {
		const parser = new DOMParser();
		dom = parser.parseFromString( html, 'text/html' ).body;
	} else {
		dom = document.createElement( 'div' );
		dom.innerHTML = html;
	}
	return dom;
}

/** Determine if url is likely pointed to an image
 * @param {string} uri - a url
 * @returns {boolean} - true or false depending on if it is probably an image (has the right extension)
 */
export function isUrlLikelyAnImage( uri ) {
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
		'embed.itunes.apple.com'
	];

	const iframeSrc = iframe.src && url.parse( iframe.src ).hostname.toLowerCase();
	return some( iframeWhitelist, function( whitelistedSuffix ) {
		return endsWith( '.' + iframeSrc, '.' + whitelistedSuffix );
	} );
}

export function isCandidateForCanonicalImage( image ) {
	if ( ! image ) {
		return false;
	}

	if ( image.width < 350 ) {
		return false;
	}

	if ( ( image.width * image.height ) < 30000 ) {
		return false;
	}
	return true;
}
