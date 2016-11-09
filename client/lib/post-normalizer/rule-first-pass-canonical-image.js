/**
 * External Dependencies
 */
import { assign, find } from 'lodash';

/**
 * Internal Dependencies
 */
import { imageSizeFromAttachments, thumbIsLikelyImage, isCandidateForCanonicalImage } from './utils';

export default function firstPassCanonicalImage( post ) {
	if ( thumbIsLikelyImage( post.post_thumbnail ) ) {
		const { URL: url, width, height } = post.post_thumbnail;
		post.canonical_image = {
			uri: url,
			width,
			height
		};
	} else if ( post.featured_image ) {
		post.canonical_image = assign( {
			uri: post.featured_image
		}, imageSizeFromAttachments( post.featured_image ) );
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
