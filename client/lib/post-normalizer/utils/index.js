/**
 * External Dependencies
 */
import { some, endsWith, findIndex } from 'lodash';
import url from 'url';

/**
 * Internal Dependencies
 */
import { isPhotonHost } from 'lib/post-normalizer/utils/is-photon-host';
import { thumbIsLikelyImage } from 'lib/post-normalizer/utils/thumb-is-likely-image';

export { isPhotonHost } from 'lib/post-normalizer/utils/is-photon-host';
export { imageSizeFromAttachments } from 'lib/post-normalizer/utils/image-size-from-attachments';
export { maxWidthPhotonishURL } from 'lib/post-normalizer/utils/max-width-photonish-url';
export { makeImageURLSafe } from 'lib/post-normalizer/utils/make-image-url-safe';
export { domForHtml } from 'lib/post-normalizer/utils/dom-for-html';
export { isUrlLikelyAnImage } from 'lib/post-normalizer/utils/is-url-likely-an-image';
export { thumbIsLikelyImage } from 'lib/post-normalizer/utils/thumb-is-likely-image';

/**
 * Determines if an iframe is from a source we trust.  We allow these to be the featured media and also give
 * them a free-er sandbox
 *
 * @param  {object} iframe the iframe to check
 * @returns {boolean} true if whitelisted
 */
export function iframeIsWhitelisted( iframe ) {
	const iframeWhitelist = [
		'youtube.com',
		'youtube-nocookie.com',
		'videopress.com',
		'video.wordpress.com',
		'vimeo.com',
		'cloudup.com',
		'soundcloud.com',
		'8tracks.com',
		'spotify.com',
		'me.sh',
		'bandcamp.com',
		'kickstarter.com',
		'facebook.com',
		'embed.itunes.apple.com',
		'nyt.com',
		'google.com',
		'mixcloud.com',
		'players.brightcove.net',
		'embed.ted.com',
		'fast.wistia.net',
		'player.twitch.tv',
		'archive.org',
		'codepen.io',
		'www.audiomack.com',
		'player.theplatform.com',
		'embed.radiopublic.com',
		'gfycat.com',
		'scribd.com',
		'megaphone.fm',
		'icloud.com',
		'read.amazon.com',
	];
	const hostName = iframe.src && url.parse( iframe.src ).hostname;
	const iframeSrc = hostName && hostName.toLowerCase();
	return some( iframeWhitelist, function( whitelistedSuffix ) {
		return endsWith( '.' + iframeSrc, '.' + whitelistedSuffix );
	} );
}

export function isCandidateForCanonicalImage( image ) {
	if ( ! image ) {
		return false;
	}

	if ( image.width < 100 ) {
		return false;
	}

	if ( image.width * image.height < 100 * 75 ) {
		return false;
	}
	return true;
}

function getPathname( uri ) {
	const parsedUrl = url.parse( uri );
	const path = parsedUrl.pathname;
	if ( isPhotonHost( parsedUrl.hostname ) ) {
		return path.substring( path.indexOf( '/', 1 ) );
	}
	return path;
}

/** returns whether or not a posts featuredImages is contained within the contents
 *
 * @param {object} post - the post to check
 * @returns {boolean|number} false if featuredImage is not within content content_images.
 *   otherwise returns the index of the dupe in post.images.
 */
export function isFeaturedImageInContent( post ) {
	if ( thumbIsLikelyImage( post.post_thumbnail ) ) {
		const featuredImagePath = getPathname( post.post_thumbnail.URL );

		const indexOfContentImage = findIndex(
			post.images,
			img => getPathname( img.src ) === featuredImagePath,
			1
		); // skip first element in post.images because it is always the featuredImage

		if ( indexOfContentImage > 0 ) {
			return indexOfContentImage;
		}
	}

	return false;
}

export function deduceImageWidthAndHeight( image ) {
	if ( image.height && image.width ) {
		return {
			height: image.height,
			width: image.width,
		};
	}
	if ( image.naturalHeight && image.naturalWidth ) {
		return {
			height: image.naturalHeight,
			width: image.naturalWidth,
		};
	}
	if ( image.dataset && image.dataset.origSize ) {
		const [ width, height ] = image.dataset.origSize.split( ',' ).map( Number );
		return {
			width,
			height,
		};
	}
	return null;
}

export const safeLinkRe = /^https?:\/\//;

/**
 * Only accept links that start with http or https. Reject others.
 *
 * @param {string} link the link to check
 * @returns {string|undefined} the safe link or undefined
 */
export function safeLink( link ) {
	if ( safeLinkRe.test( link ) ) {
		return link;
	}
	return undefined;
}
