/**
 * External dependencies
 */
import { find } from 'lodash';

/**
 * Internal dependencies
 */
import { thumbIsLikelyImage, isCandidateForCanonicalImage } from './utils';

export default function pickCanonicalImage( post ) {
	let canonicalImage;
	if ( thumbIsLikelyImage( post.post_thumbnail ) ) {
		const { URL: url, width, height } = post.post_thumbnail;
		canonicalImage = {
			uri: url,
			width,
			height,
		};
	} else if ( post.content_images && post.content_images.length ) {
		const candidateImage = find( post.content_images, isCandidateForCanonicalImage );
		if ( candidateImage ) {
			canonicalImage = {
				uri: candidateImage.src,
				width: candidateImage.width,
				height: candidateImage.height,
			};
		}
	}
	if ( canonicalImage ) {
		post.canonical_image = canonicalImage;
	}
	return post;
}
