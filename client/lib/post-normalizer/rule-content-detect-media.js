/**
 * External Dependencies
 */
import { map, compact, includes, some } from 'lodash';

/**
 * Internal Dependencies
 */
import { iframeIsWhitelisted } from './utils';

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
		( urlPart ) => includes( imageUrl.toLowerCase(), urlPart )
	);

	return ! ( isTrackingPixel( image ) || imageShouldBeExcludedFromCandidacy );
}

/** detects and returns  metadata if it should be considered as a content image
* @param {image} image - the image
* @returns {object} metadata - regarding the image or null
*/
const detectImage = ( image ) => {
	if ( isCandidateForContentImage( image ) ) {
		return {
			src: image.getAttribute( 'src' ),
			width: image.width,
			height: image.height,
			mediaType: 'image',
		};
	}
	return false;
};

// get the iframe src that autoplays the embed if we know how to, else null
const getAutoplayIframe = ( iframe ) => {
	if ( iframe.src.indexOf( 'youtube' ) > 0 ) {
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

// get a picture thumnail version of the embed if it exists, else null
const getThumbnailUrl = ( iframe ) => {
	if ( iframe.src.indexOf( 'youtube' ) > 0 ) {
		// grabbed from: http://stackoverflow.com/questions/3452546/javascript-regex-how-to-get-youtube-video-id-from-url
		const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
		const match = iframe.src.match( regExp );
		const videoId = match && ( match && match[ 2 ].length === 11 ) ? match[ 2 ] : false;

		return videoId ? `https://img.youtube.com/vi/${ videoId }/mqdefault.jpg` : null;
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
			return ( matches[ 1 ] );
		}
	} while ( ( node = node.parentNode ) );

	return null;
};

const detectEmbed = ( iframe ) => {
	if ( ! iframeIsWhitelisted( iframe ) ) {
		return false;
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
		autoplayIframe: getAutoplayIframe( iframe ),
		thumbnailUrl: getThumbnailUrl( iframe ),
	};
};

/** Adds an ordered list of all of the content_media to the post
* @param {post} post - the post object to add content_media to
* @param {dom} dom - the dom of the post to scan for media
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

	return post;
}
