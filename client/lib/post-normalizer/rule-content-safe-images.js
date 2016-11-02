/**
* External Dependencies
*/
import url from 'url';
import { forEach, startsWith, some, includes, filter } from 'lodash';

/**
 * Internal Dependencies
 */
import { maxWidthPhotonishURL } from './utils';
import safeImageURL from 'lib/safe-image-url';
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

export default function makeImagesSafe( post, dom, maxWidth ) {
	const images = dom.querySelectorAll( 'image[src]' );
	forEach( images, ( image ) => makeImageSafe( post, image, maxWidth ) );

	return post;
}
