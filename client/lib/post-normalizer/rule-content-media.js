/**
 * External Dependencies
 */
import url from 'url';
import { map, compact, filter, includes, startsWith, endsWith, some, toArray } from 'lodash';

/**
 * Internal Dependencies
 */
import safeImageURL from 'lib/safe-image-url';
import { maxWidthPhotonishURL } from './utils';

const TRANSPARENT_GIF = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

/**
* @param {Node} node - Takes in a DOM Node and mutates it so that it no longer has an 'on*' event handlers e.g. onClick
*/
const removeUnwantedAttributes = ( node ) => {
	if ( ! node || ! node.hasAttributes() ) {
		return;
	}

	const inlineEventHandlerAttributes = filter( node.attributes, ( attr ) => startsWith( attr.name, 'on' ) );
	inlineEventHandlerAttributes.forEach( ( a ) => node.removeAttribute( a ) );

	// always remove srcset because they are very difficult to make safe and may not be worth the trouble
	node.removeAttribute( 'srcset' );
};

/** Checks whether or not an image is a tracking pixel
* @param {Node} image - DOM node for an img
* @returns {boolean} isTrackingPixel - returns true if image is probably a tracking pixel
*/
function isTrackingPixel( image ) {
	if ( ! image || ! image.src ) {
		return false;
	}

	const edgeLength = image.height + image.width;
	return edgeLength === 1 || edgeLength === 2;
}

/** Checks whether or not imageUrl shoudl be removed from the dom
 * @param {string} imageUrl - the url of the image
 * @returns {boolean} whether or not it should be removed from the dom
 */
const imageShouldBeRemovedFromContent = ( imageUrl ) => {
	if ( ! imageUrl ) {
		return;
	}

	const bannedUrlParts = [
		'feeds.feedburner.com',
		'feeds.wordpress.com/',
		'.feedsportal.com',
		'wp-includes',
		'wp-content/themes',
		'wp-content/plugins',
		'stats.wordpress.com',
		'pixel.wp.com'
	];

	return some( bannedUrlParts, ( part ) => includes( imageUrl.toLowerCase(), part ) );
};

function isCandidateForContentImage( image ) {
	if ( ! image || ! image.getAttribute( 'src' ) ) {
		return false;
	}

	const ineligibleCandidateUrlParts = [
		'gravatar.com',
		'/wpcom-smileys/',
	];

	const imageUrl = image.getAttribute( 'src' );

	const imageShouldBeExcludedFromCandidacy = some( ineligibleCandidateUrlParts,
		( part ) => includes( imageUrl.toLowerCase(), part )
	);

	return ! ( isTrackingPixel( image ) || imageShouldBeRemovedFromContent( imageUrl ) ||
		imageShouldBeExcludedFromCandidacy );
}

const makeImageSafe = ( post, image, maxWidth ) => {
	let imgSource = image.getAttribute( 'src' );
	const parsedImgSrc = url.parse( imgSource, false, true );
	const hostName = parsedImgSrc.hostname;

	// if imgSource is relative, prepend post domain so it isn't relative to calypso
	if ( ! hostName ) {
		imgSource = url.resolve( post.URL, imgSource );
	}

	const safeSource = maxWidthPhotonishURL( safeImageURL( imgSource ), maxWidth );
	removeUnwantedAttributes( image );

	// trickery to remove it from the dom / not load the image
	// TODO: test if this is necessary
	if ( ! safeSource || imageShouldBeRemovedFromContent( imgSource ) ) {
		image.remove();
		// fun fact: removing the node from the DOM will not prevent it from loading. You actually have to
		// change out the src to change what loads. The following is a 1x1 transparent gif as a data URL
		image.setAttribute( 'src', TRANSPARENT_GIF );
		return;
	}

	image.setAttribute( 'src', safeSource );

	// return original source
	return imgSource;
};

/** Processes an image.  This does 2 things:
* 1. Mutates the dom to make it safe/remove it if necessary
* 2. Returns extra metadata if it should be considered as a content image
* @param {post} post - the post whose image to process_image
* @param {image} image - the image to process
* @param {maxWidth} maxWidth - the max width with which to request images with from photon-ish urls
* @returns {content_media} metadata - regarding the image or null
*/
const process_image = ( post, image, maxWidth ) => {
	const originalSrc = makeImageSafe( post, image, maxWidth );

	if ( isCandidateForContentImage( image ) ) {
		return {
			src: image.getAttribute( 'src' ),
			original_src: originalSrc,
			width: image.width,
			height: image.height,
			mediaType: 'image',
		};
	}
	return false;
};

const isWhitelisted = ( iframe ) => {
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
};

// hosts that we trust that don't work in a sandboxed iframe
const isTrustedHost = ( iframeHost ) => {
	const iframeNoSandbox = [
		'spotify.com',
		'kickstarter.com'
	];

	return some( iframeNoSandbox, function( accepted ) {
		return endsWith( '.' + iframeHost, '.' + accepted );
	} );
};

// TODO: i don't like this.
const getEmbedType = ( iframe ) => {
	let node = iframe;
	let matches;

	do {
		if ( ! node.className ) {
			continue;
		}
		matches = node.className.match( /\bembed-([-a-zA-Z0-9_]+)\b/ );
		if ( matches ) {
			return ( matches[ 1 ] );
		}
	} while ( ( node = node.parentNode ) );
};

//	let embeds = toArray( dom.querySelectorAll( 'iframe' ) );
const process_embed = ( post, iframe ) => {
	if ( ! isWhitelisted( iframe ) ) {
		return false;
	}

	const iframeHost = iframe.src && url.parse( iframe.src ).hostname.toLowerCase();

	if ( isTrustedHost( iframeHost ) ) {
		iframe.removeAttribute( 'sandbox' );
	} else {
		// we allow featured iframes to use a free-er sandbox
		iframe.setAttribute( 'sandbox', 'allow-same-origin allow-scripts allow-popups' );
	}

	const width = Number( iframe.width );
	const height = Number( iframe.height );
	const aspectRatio = width / height;

	const embedUrl = iframe.getAttribute( 'data-wpcom-embed-url' );

	return {
		type: getEmbedType( iframe ),
		src: iframe.src,
		embedUrl,
		iframe: iframe.outerHTML,
		aspectRatio: aspectRatio,
		width: width,
		height: height,
		mediaType: 'video',
	};
};

/**  currently an overloaded function. it makes all the media safe AND returns an
* ordered list of all of the media
*
*/
export default function content_media( post, dom, maxWidth ) {
	const imageSelector = 'img[src]';
	const embedSelector = 'iframe';
	const media = toArray( dom.querySelectorAll( `${ imageSelector }, ${ embedSelector }` ) );

	const contentMedia = map( media, ( element ) => {
		const nodeName = element.nodeName.toLowerCase();

		if ( nodeName === 'iframe' ) {
			return process_embed( post, element );
		} else if ( nodeName === 'img' ) {
			return process_image( post, element, maxWidth );
		}
		return false;
	} );

	post.content_media = compact( contentMedia );
	return post;
}
