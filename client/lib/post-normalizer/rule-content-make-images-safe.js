import { getUrlParts, getUrlFromParts, safeImageUrl } from '@automattic/calypso-url';
import { forEach, startsWith, some, includes, filter } from 'lodash';
import { resolveRelativePath } from 'calypso/lib/url';
import { maxWidthPhotonishURL } from './utils';

const TRANSPARENT_GIF =
	'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

/**
 * @param {window.Node} node - Takes in a DOM Node and mutates it so that it no longer has an 'on*' event handlers e.g. onClick
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

/**
 * Checks whether or not imageUrl should be removed from the dom
 *
 * @param {string} imageUrl - the url of the image
 * @returns {boolean} whether or not it should be removed from the dom
 */
const imageShouldBeRemovedFromContent = ( imageUrl ) => {
	if ( ! imageUrl ) {
		return false;
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

function provideProtocol( post, url ) {
	const postUrlParts = getUrlParts( post.URL );

	// The image on the relative-protocol URL will have the same protocol with the post
	if ( url.startsWith( '//' ) ) {
		return `${ postUrlParts.protocol || 'https:' }${ url }`;
	}

	return url;
}

function makeImageSafe( post, image, maxWidth ) {
	let imgSource = image.getAttribute( 'src' );
	const imgSourceParts = getUrlParts( imgSource );
	const hostName = imgSourceParts.hostname;

	// if imgSource is relative, prepend post domain so it isn't relative to calypso
	if ( ! hostName ) {
		const postUrlParts = getUrlParts( post.URL );
		imgSource = getUrlFromParts( {
			protocol: postUrlParts.protocol,
			host: postUrlParts.host,
			pathname: resolveRelativePath( postUrlParts.pathname, imgSourceParts.pathname ),
		} ).href;
	}

	let safeSource = maxWidth
		? maxWidthPhotonishURL( safeImageUrl( imgSource ), maxWidth )
		: safeImageUrl( imgSource );

	// When the image URL is not photoned, try providing protocol
	if ( ! safeSource ) {
		imgSource = provideProtocol( post, imgSource );
	}

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
