/**
 * External Dependencies
 */
import filter from 'lodash/filter';
import debugFactory from 'debug';

/**
 * Internal Dependencies
 */

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
	var canonicalImage;
	if ( post.images ) {
		canonicalImage = filter( post.images, candidateForCanonicalImage )[ 0 ];
		if ( canonicalImage ) {
			canonicalImage = {
				uri: canonicalImage.src,
				width: canonicalImage.naturalWidth,
				height: canonicalImage.naturalHeight
			};
		}
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
