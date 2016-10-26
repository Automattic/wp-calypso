/**
 * External Dependencies
 */
import { startsWith, every, endsWith, forEach, forOwn, some, toArray, url } from 'lodash';
import srcset from 'srcset';

/**
 * Internal Dependencies
 */
import safeImageURL from 'lib/safe-image-url';
import { maxWidthPhotonishURL } from './utils';

const TRANSPARENT_GIF = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

function removeUnsafeAttributes( node ) {
	if ( ! node || ! node.hasAttributes() ) {
		return;
	}

	// Have to toArray this because attributes is a live
	// NodeMap and would node removals would invalidate
	// the current index as we walked it.
	forEach( toArray( node.attributes ), function( attr ) {
		if ( startsWith( attr.name, 'on' ) ) {
			node.removeAttribute( attr.name );
		}
	} );
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

function imageShouldBeRemovedFromContent( imageUrl ) {
	return some( bannedUrlParts, function( part ) {
		return imageUrl && imageUrl.toLowerCase().indexOf( part ) !== -1;
	} );
}

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
	return ! imageShouldBeRemovedFromContent( imageUrl ) && every( excludedContentImageUrlParts, function( part ) {
		return imageUrl && imageUrl.toLowerCase().indexOf( part ) === -1;
	} );
}

	// push everything, including tracking pixels, over to a safe URL
let process_image = ( post, image, maxWidth ) => {
	let imgSource = image.getAttribute( 'src' ),
		parsedImgSrc = url.parse( imgSource, false, true ),
		hostName = parsedImgSrc.hostname;

	let safeSource;
	// if imgSource is relative, prepend post domain so it isn't relative to calypso
	if ( ! hostName ) {
		imgSource = url.resolve( post.URL, imgSource );
		parsedImgSrc = url.parse( imgSource, false, true );
	}

	safeSource = safeImageURL( imgSource );
	if ( ! safeSource && parsedImgSrc.search ) {
		// we can't make externals with a querystring safe.
		// try stripping it and retry
		parsedImgSrc.search = null;
		parsedImgSrc.query = null;
		safeSource = safeImageURL( url.format( parsedImgSrc ) );
	}

	removeUnsafeAttributes( image );

	if ( ! safeSource || imageShouldBeRemovedFromContent( imgSource ) ) {
		image.parentNode.removeChild( image );
		// fun fact: removing the node from the DOM will not prevent it from loading. You actually have to
		// change out the src to change what loads. The following is a 1x1 transparent gif as a data URL
		image.setAttribute( 'src', TRANSPARENT_GIF );
		image.removeAttribute( 'srcset' );
		return;
	}

	if ( maxWidth ) {
		safeSource = maxWidthPhotonishURL( safeSource, maxWidth );
	}

	image.setAttribute( 'src', safeSource );

	if ( image.hasAttribute( 'srcset' ) ) {
		let imgSrcSet;
		try {
			imgSrcSet = srcset.parse( image.getAttribute( 'srcset' ) );
		} catch ( ex ) {
			// if srcset parsing fails, set the srcset to an empty array. This will have the effect of removing the srcset entirely.
			imgSrcSet = [];
		}
		imgSrcSet = imgSrcSet.map( imgSrc => {
			if ( ! url.parse( imgSrc.url, false, true ).hostname ) {
				imgSrc.url = url.resolve( post.URL, imgSrc.url );
			}
			imgSrc.url = safeImageURL( imgSrc.url );
			return imgSrc;
		} ).filter( imgSrc => imgSrc.url );
		const newSrcSet = srcset.stringify( imgSrcSet );
		if ( newSrcSet ) {
			image.setAttribute( 'srcset', newSrcSet );
		} else {
			image.removeAttribute( 'srcset' );
		}
	}

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
}

//	let embeds = toArray( dom.querySelectorAll( 'iframe' ) );
const process_embed = ( post, dom, iframe ) => {
	if ( ! allowedEmbed( iframe ) ) {
		return false;
	}

	var node = iframe,
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
}

// TODO add this to querySelectorAll higher up + combine for orderrrr
let funnyEmbeds = ( dom ) => {

	let content_embeds = [];

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
}

funnyEmbeds();
process_embed();
process_image();
