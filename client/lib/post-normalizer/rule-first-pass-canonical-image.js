/**
 * External Dependencies
 */
import { assign, filter, head, startsWith } from 'lodash';

/**
 * Internal Dependencies
 */
import { imageSizeFromAttachments, thumbIsLikelyImage } from './utils';

export default function firstPassCanonicalImage( post ) {
	if ( thumbIsLikelyImage( post.post_thumbnail ) ) {
		const { URL: url, width, height } = post.post_thumbnail;
		post.canonical_image = {
			uri: url,
			width,
			height,
			type: 'image'
		};
	} else if ( post.featured_image ) {
		post.canonical_image = assign( {
			uri: post.featured_image,
			type: 'image'
		}, imageSizeFromAttachments( post.featured_image ) );
	} else {
		const candidate = head( filter( post.attachments, function( attachment ) {
			return startsWith( attachment.mime_type, 'image/' );
		} ) );

		if ( candidate ) {
			post.canonical_image = {
				uri: candidate.URL,
				width: candidate.width,
				height: candidate.height,
				type: 'image'
			};
		}
	}
	return post;
}
