/**
 * External Dependencies
 */
import { find } from 'lodash';
import debugFactory from 'debug';

/**
 * Internal Dependencies
 */
import { thumbIsLikelyImage } from './utils';

const debug = debugFactory( 'calypso:post-normalizer:pick-canonical-image' );

function candidateForCanonicalImage( image ) {
	if ( ! image ) {
		return false;
	}

	if ( image.naturalWidth < 350 ) {
		debug( ( image && image.src ), ': not wide enough' );
		return false;
	}

	if ( ( image.naturalWidth * image.naturalHeight ) < 30000 ) {
		debug( ( image && image.src ), ': not enough area' );
		return false;
	}
	return true;
}

export default function pickCanonicalImage( post ) {
	let canonicalImage;
	if ( post.canonical_image ) {
		post.canonical_image = null;
	}
	if ( post.images ) {
		canonicalImage = find( post.images, candidateForCanonicalImage );
		if ( canonicalImage ) {
			canonicalImage = {
				uri: canonicalImage.src,
				width: canonicalImage.naturalWidth,
				height: canonicalImage.naturalHeight
			};
		}
	} else if ( thumbIsLikelyImage( post.post_thumbnail ) ) {
		canonicalImage = {
			uri: post.post_thumbnail.URL,
			width: post.post_thumbnail.width,
			height: post.post_thumbnail.height
		};
	} else if ( post.featured_image ) {
		canonicalImage = {
			uri: post.featured_image,
			width: 0,
			height: 0
		};
	}

	if ( canonicalImage ) {
		post.canonical_image = canonicalImage;
	}
	return post;
}
