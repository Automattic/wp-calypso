/**
 * External dependencies
 */

import { map, compact, includes, some, filter } from 'lodash';
import getEmbedMetadata from 'get-video-id';

/**
 * Internal Dependencies
 */
import { iframeIsWhitelisted, maxWidthPhotonishURL, deduceImageWidthAndHeight } from './utils';
import { READER_CONTENT_WIDTH } from 'state/reader/posts/sizes';

/** Checks whether or not an image is a tracking pixel
 *
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

/** Returns true if image should be considered
 *
 * @param {Node} image - DOM node for an image
 * @returns {boolean} true/false depending on if it should be included as a potential featured image
 */
function isCandidateForContentImage( image ) {
	if ( ! image || ! image.getAttribute( 'src' ) ) {
		return false;
	}

	const ineligibleCandidateUrlParts = [ 'gravatar.com', '/wpcom-smileys/' ];

	const imageUrl = image.getAttribute( 'src' );

	const imageShouldBeExcludedFromCandidacy = some( ineligibleCandidateUrlParts, ( urlPart ) =>
		includes( imageUrl.toLowerCase(), urlPart )
	);

	return ! ( isTrackingPixel( image ) || imageShouldBeExcludedFromCandidacy );
}

/** Detects and returns metadata if it should be considered as a content image
 *
 * @param {image} image - the image
 * @returns {object} metadata - regarding the image or null
 */
const detectImage = ( image ) => {
	if ( isCandidateForContentImage( image ) ) {
		const { width, height } = deduceImageWidthAndHeight( image ) || { width: 0, height: 0 };
		return {
			src: maxWidthPhotonishURL( image.getAttribute( 'src' ), READER_CONTENT_WIDTH ),
			width: width,
			height: height,
			mediaType: 'image',
		};
	}
	return false;
};

/**  For an iframe we know how to process, return a string for an autoplaying iframe
 *
 * @param {Node} iframe - DOM node for an iframe
 * @returns {string} html src for an iframe that autoplays if from a source we understand.  else null;
 */
const getAutoplayIframe = ( iframe ) => {
	const KNOWN_SERVICES = [ 'youtube', 'vimeo', 'videopress' ];
	const metadata = getEmbedMetadata( iframe.src );
	if ( metadata && includes( KNOWN_SERVICES, metadata.service ) ) {
		const autoplayIframe = iframe.cloneNode();
		if ( autoplayIframe.src.indexOf( '?' ) === -1 ) {
			autoplayIframe.src += '?autoplay=1';
		} else {
			autoplayIframe.src += '&autoplay=1';
		}
		return autoplayIframe.outerHTML;
	}
	return null;
};

const getEmbedType = ( iframe ) => {
	let node = iframe;
	let matches;

	do {
		if ( ! node.className ) {
			continue;
		}
		matches = node.className.match( /\bembed-([-a-zA-Z0-9_]+)\b/ );
		if ( matches ) {
			return matches[ 1 ];
		}
	} while ( ( node = node.parentNode ) );

	return null;
};

/** Detects and returns metadata if it should be considered as a content iframe
 *
 * @param {Node} iframe - a DOM node for an iframe
 * @returns {metadata} metadata - metadata for an embed
 */
const detectEmbed = ( iframe ) => {
	if ( ! iframeIsWhitelisted( iframe ) ) {
		return false;
	}

	const width = Number( iframe.width );
	const height = Number( iframe.height );
	const aspectRatio = width / height;

	return {
		type: getEmbedType( iframe ),
		src: iframe.src,
		iframe: iframe.outerHTML,
		aspectRatio: aspectRatio,
		width: width,
		height: height,
		mediaType: 'video',
		autoplayIframe: getAutoplayIframe( iframe ),
	};
};

/** Adds an ordered list of all of the content_media to the post
 *
 * @param {post} post - the post object to add content_media to
 * @param {dom} dom - the dom of the post to scan for media
 * @returns {PostMetadata} post - the post object mutated to also have content_media
 */
export default function detectMedia( post, dom ) {
	const imageSelector = 'img[src]';
	const embedSelector = 'iframe';
	const media = dom.querySelectorAll( `${ imageSelector }, ${ embedSelector }` );

	const contentMedia = map( media, ( element ) => {
		const nodeName = element.nodeName.toLowerCase();

		if ( nodeName === 'iframe' ) {
			return detectEmbed( element );
		} else if ( nodeName === 'img' ) {
			return detectImage( element );
		}
		return false;
	} );

	post.content_media = compact( contentMedia );
	post.content_embeds = filter( post.content_media, ( m ) => m.mediaType === 'video' );
	post.content_images = filter( post.content_media, ( m ) => m.mediaType === 'image' );

	// TODO: figure out a more sane way of combining featured_image + content media
	// so that changes to logic don't need to exist in multiple places
	if ( post.featured_image ) {
		post.featured_image = maxWidthPhotonishURL( post.featured_image, READER_CONTENT_WIDTH );
	}

	return post;
}
