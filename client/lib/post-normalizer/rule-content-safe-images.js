/**
 * External Dependencies
 */
import filter from 'lodash/filter';
import forEach from 'lodash/forEach';
import every from 'lodash/every';
import some from 'lodash/some';
import startsWith from 'lodash/startsWith';
import toArray from 'lodash/toArray';
import url from 'url';
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

function isCandidateForContentImage( imageUrl ) {
	return ! imageShouldBeRemovedFromContent( imageUrl ) && every( excludedContentImageUrlParts, function( part ) {
		return imageUrl && imageUrl.toLowerCase().indexOf( part ) === -1;
	} );
}

export default function( maxWidth ) {
	return function safeContentImages( post, dom ) {
		var content_images = [],
			images;

		if ( ! dom ) {
			throw new Error( 'this transform must be used as part of withContentDOM' );
		}
		images = dom.querySelectorAll( 'img[src]' );

		// push everything, including tracking pixels, over to a safe URL
		forEach( images, function( image ) {
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
				const imgSrcSet = srcset.parse( image.getAttribute( 'srcset' ) ).map( imgSrc => {
					if ( ! url.parse( imgSrc.url, false, true ).hostname ) {
						imgSrc.url = url.resolve( post.URL, imgSrc.url );
					}
					imgSrc.url = safeImageURL( imgSrc.url );
					return imgSrc;
				} ).filter( imgSrc => imgSrc.url );
				image.setAttribute( 'srcset', srcset.stringify( imgSrcSet ) );
			}

			if ( isCandidateForContentImage( imgSource ) ) {
				content_images.push( {
					src: safeSource,
					original_src: imgSource,
					width: image.width,
					height: image.height
				} );
			}
		} );

		// grab all of the non-tracking pixels and push them into content_images
		content_images = filter( content_images, function( image ) {
			if ( ! image.src ) return false;
			const edgeLength = image.height + image.width;
			// if the image size isn't set (0) or is greater than 2, keep it
			return edgeLength === 0 || edgeLength > 2;
		} );

		if ( content_images.length ) {
			post.content_images = content_images;
		}

		return post;
	};
}
