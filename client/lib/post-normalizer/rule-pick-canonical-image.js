/**
 * External Dependencies
 */
import { find } from 'lodash';

/**
 * Internal Dependencies
 */
import { thumbIsLikelyImage, isCandidateForCanonicalImage } from './utils';

export default function pickCanonicalImage( post ) {
	if ( thumbIsLikelyImage( post.post_thumbnail ) ) {
		const { URL: url, width, height } = post.post_thumbnail;
		post.canonical_image = {
			uri: url,
			width,
			height
		};
	} else if ( post.content_images && post.content_images.length ) {
		const canonicalImage = find( post.content_images, isCandidateForCanonicalImage );
		if ( canonicalImage ) {
			post.canonical_image = {
				uri: canonicalImage.src,
				width: canonicalImage.width,
				height: canonicalImage.height
			};
		}
	}
	return post;
}
