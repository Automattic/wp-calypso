/**
 * External Dependencies
 */
import find from 'lodash/find';
import forEach from 'lodash/forEach';
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

	let parsedURL = url.parse( imageURL, true, true ), // true, true means allow protocol-less hosts and parse the querystring
		isGravatar, sizeParam;

	if ( ! parsedURL.host ) {
		return imageURL;
	}

	isGravatar = parsedURL.host.indexOf( 'gravatar.com' ) !== -1;

	delete parsedURL.search;
	// strip other sizing params
	forEach( [ 'h', 'crop', 'resize', 'fit' ], function( param ) {
		delete parsedURL.query[ param ];
	} );

	sizeParam = isGravatar ? 's' : 'w';
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
