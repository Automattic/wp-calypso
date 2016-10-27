/**
 * External Dependencies
 */
import { filter, include, startsWith, endsWith, forEach, forOwn, some, toArray, url } from 'lodash';

/**
 * Internal Dependencies
 */
import safeImageURL from 'lib/safe-image-url';

const TRANSPARENT_GIF = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

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

/**
* @param {Node} node - Takes in a DOM Node and mutates it so that it no longer has an 'on*' event handlers e.g. onClick
*/
const removeInlineEventHandlers = ( node ) => {
	if ( ! node || ! node.hasAttributes() ) {
		return;
	}

	const inlineEventHandlerAttributes = filter( node.attributes, ( attr ) => startsWith( attr.name, 'on' ) );
	inlineEventHandlerAttributes.forEach( ( handler ) => node.removeAttribute( handler ) );
};

/** Checks whether or not imageUrl shoudl be removed from the dom
 * @param {string} imageUrl - the url of the image
 * @returns {boolean} whether or not it should be removed from the dom
 */
const imageShouldBeRemovedFromContent = ( imageUrl ) => {
	if ( ! imageUrl ) {
		return;
	}

	return some( bannedUrlParts, ( part ) => include( imageUrl.toLowerCase(), part ) );
};

const excludedContentImageUrlParts = [
	'gravatar.com',
	'/wpcom-smileys/'
];

function isTrackingPixel( image ) {
	if ( ! image || ! image.src ) {
		return false;
	}

	const edgeLength = image.height + image.width;
	// if the image size isn't set (0) or is greater than 2, keep it
	return edgeLength === 0 || edgeLength > 2;
}

function isCandidateForContentImage( imageUrl ) {
	if ( ! imageUrl ) {
		return false;
	}
	const imageShouldBeExcludedFromCandidacy = some( excludedContentImageUrlParts,
		( part ) => include( imageUrl.toLowerCase(), part )
	);

	return ! imageShouldBeRemovedFromContent( imageUrl ) && ! imageShouldBeExcludedFromCandidacy;
}

	// push everything, including tracking pixels, over to a safe URL
const process_image = ( post, image, maxWidth ) => {
	let imgSource = image.getAttribute( 'src' );
	let parsedImgSrc = url.parse( imgSource, false, true );
	const hostName = parsedImgSrc.hostname;

	maxWidth;
	// if imgSource is relative, prepend post domain so it isn't relative to calypso
	if ( ! hostName ) {
		imgSource = url.resolve( post.URL, imgSource );
		parsedImgSrc = url.parse( imgSource, false, true );
	}

	const safeSource = safeImageURL( imgSource );
	removeInlineEventHandlers( image );

	// always remove srcset because they are very difficult to make safe and may not be worth the trouble
	image.removeAttribute( 'srcset' );

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

	if ( isCandidateForContentImage( imgSource ) && ! isTrackingPixel( image ) ) {
		return {
			src: safeSource,
			original_src: imgSource,
			width: image.width,
			height: image.height,
			mediaType: 'image',
		};
	}
	return false;
};

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

// hosts that we trust that don't work in a sandboxed iframe
const iframeNoSandbox = [
	'spotify.com',
	'kickstarter.com'
];

const allowedEmbed = ( iframe ) => {
	const iframeSrc = iframe.src && url.parse( iframe.src ).hostname.toLowerCase();
	return some( iframeWhitelist, function( whitelistedSuffix ) {
		return endsWith( '.' + iframeSrc, '.' + whitelistedSuffix );
	} );
};

//	let embeds = toArray( dom.querySelectorAll( 'iframe' ) );
const process_embed = ( post, dom, iframe ) => {
	if ( ! allowedEmbed( iframe ) ) {
		return false;
	}

	let node = iframe,
		embedType = null,
		aspectRatio,
		width, height,
		matches;

	const iframeHost = iframe.src && url.parse( iframe.src ).hostname.toLowerCase();
	const trustedHost = some( iframeNoSandbox, function( accepted ) {
		return endsWith( '.' + iframeHost, '.' + accepted );
	} );

	if ( trustedHost ) {
		iframe.removeAttribute( 'sandbox' );
	} else {
		// we allow featured iframes to use a free-er sandbox
		iframe.setAttribute( 'sandbox', 'allow-same-origin allow-scripts allow-popups' );
	}

	if ( iframe.width && iframe.height ) {
		width = Number( iframe.width );
		height = Number( iframe.height );
		if ( ! isNaN( width ) && ! isNaN( height ) ) {
			aspectRatio = width / height;
		}
		if ( isNaN( width ) ) {
			width = iframe.width;
		}
		if ( isNaN( height ) ) {
			height = iframe.height;
		}
	}

	const embedUrl = iframe.getAttribute( 'data-wpcom-embed-url' );

	do {
		if ( ! node.className ) {
			continue;
		}
		matches = node.className.match( /\bembed-([-a-zA-Z0-9_]+)\b/ );
		if ( matches ) {
			embedType = matches[ 1 ];
			break;
		}
	} while ( ( node = node.parentNode ) );

	return {
		type: embedType,
		src: iframe.src,
		embedUrl,
		iframe: iframe.outerHTML,
		aspectRatio: aspectRatio,
		width: width,
		height: height,
		mediaType: 'video',
	};
};

// TODO add this to querySelectorAll higher up + combine for orderrrr
const processFunnyEmbeds = ( dom ) => {
	const content_embeds = [];

	const funnyEmbedSelectors = {
		'blockquote[class^="instagram-"]': 'instagram',
		'blockquote[class^="twitter-"]': 'twitter',
		'fb\\\:post': 'facebook',
		'[class^="fb-"]': 'facebook'
	};

	forOwn( funnyEmbedSelectors, function( type, selector ) {
		const funnyEmbeds = toArray( dom.querySelectorAll( selector ) );
		forEach( funnyEmbeds, function( node ) {
			content_embeds.push( {
				type: 'special-' + type,
				content: node.outerHTML
			} );
		} );
	} );
};

export default function content_media( post, dom ) {
	// 1. selector for everything -- that should return it all in the correct order. May be tricky for funny embeds

	// 2. map returned array with a switch on the successful selector - and process accordingly

	// 3. filter falses
	processFunnyEmbeds();
	process_embed();
	process_image();
	dom;
}
