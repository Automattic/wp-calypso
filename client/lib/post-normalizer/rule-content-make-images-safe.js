/**
 * External dependencies
 */

import url from 'url';
import { forEach, startsWith, some, includes, filter } from 'lodash';

/**
 * Internal Dependencies
 */
import safeImageURL from 'lib/safe-image-url';
import { maxWidthPhotonishURL } from './utils';

const TRANSPARENT_GIF =
	'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

/**
 * @param {Node} node - Takes in a DOM Node and mutates it so that it no longer has an 'on*' event handlers e.g. onClick
 */
const removeUnwantedAttributes = ( node ) => {
	if ( ! node || ! node.hasAttributes() ) {
		return;
	}

	const inlineEventHandlerAttributes = filter( node.attributes, ( attr ) =>
		startsWith( attr.name, 'on' )
	);
	inlineEventHandlerAttributes.forEach( ( a ) => node.removeAttribute( a.name ) );

	// always remove srcset because they are very difficult to make safe and may not be worth the trouble
	node.removeAttribute( 'srcset' );
};

/** Checks whether or not imageUrl should be removed from the dom
 *
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
		'pixel.wp.com',
	];

	return some( bannedUrlParts, ( part ) => includes( imageUrl.toLowerCase(), part ) );
};

function makeImageSafe( post, image, maxWidth ) {
	let imgSource = image.getAttribute( 'src' );
	const parsedImgSrc = url.parse( imgSource, false, true );
	const hostName = parsedImgSrc.hostname;

	// if imgSource is relative, prepend post domain so it isn't relative to calypso
	if ( ! hostName ) {
		imgSource = url.resolve( post.URL, imgSource );
	}

	let safeSource = maxWidth
		? maxWidthPhotonishURL( safeImageURL( imgSource ), maxWidth )
		: safeImageURL( imgSource );

	// allow https sources through even if we can't make them 'safe'
	// helps images that use querystring params and are from secure sources
	if ( ! safeSource && startsWith( imgSource, 'https://' ) ) {
		safeSource = imgSource;
	}

	removeUnwantedAttributes( image );

	// trickery to remove it from the dom / not load the image
	// TODO: test if this is necessary
	if ( ! safeSource || imageShouldBeRemovedFromContent( imgSource ) ) {
		image.parentNode.removeChild( image );
		// fun fact: removing the node from the DOM will not prevent it from loading. You actually have to
		// change out the src to change what loads. The following is a 1x1 transparent gif as a data URL
		image.setAttribute( 'src', TRANSPARENT_GIF );
		return;
	}

	image.setAttribute( 'src', safeSource );
}

const makeImagesSafe = ( maxWidth ) => ( post, dom ) => {
	if ( ! dom ) {
		throw new Error( 'this transform must be used as part of withContentDOM' );
	}

	const images = dom.querySelectorAll( 'img[src]' );
	forEach( images, ( image ) => makeImageSafe( post, image, maxWidth ) );

	return post;
};

export default makeImagesSafe;
