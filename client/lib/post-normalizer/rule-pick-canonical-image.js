/**
 * External Dependencies
 */
import { find } from 'lodash';

/**
 * Internal Dependencies
 */
import { thumbIsLikelyImage, isCandidateForCanonicalImage } from './utils';



export default function pickCanonicalImage( post ) {
	let canonicalImage;
	if ( post.canonical_image ) {
		post.canonical_image = null;
	}
	if ( post.images ) {
		canonicalImage = find( post.images, isCandidateForCanonicalImage );
		if ( canonicalImage ) {
			canonicalImage = {
				uri: canonicalImage.src,
				width: canonicalImage.width,
				height: canonicalImage.height
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
