/**
 * External Dependencies
 */
import assign from 'lodash/assign';
import filter from 'lodash/filter';
import head from 'lodash/head';
import startsWith from 'lodash/startsWith';

/**
 * Internal Dependencies
 */
import { imageSizeFromAttachments } from './utils';

export default function firstPassCanonicalImage( post ) {
	if ( post.featured_image ) {
		post.canonical_image = assign( {
			uri: post.featured_image,
			type: 'image'
		}, imageSizeFromAttachments( post.featured_image ) );
	} else {
		let candidate = head( filter( post.attachments, function( attachment ) {
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
