/**
 * External Dependencies
 */
import forOwn from 'lodash/forOwn';
import startsWith from 'lodash/startsWith';

/**
 * Internal Dependencies
 */
import { makeImageURLSafe } from './utils';

export default function safeImagePropertiesForWidth( maxWidth ) {
	return function safeImageProperties( post ) {
		makeImageURLSafe( post.author, 'avatar_URL', maxWidth );
		makeImageURLSafe( post, 'featured_image', maxWidth, post.URL );
		if ( post.featured_media && post.featured_media.type === 'image' ) {
			makeImageURLSafe( post.featured_media, 'uri', maxWidth, post.URL );
		}
		if ( post.canonical_image && post.canonical_image.type === 'image' ) {
			makeImageURLSafe( post.canonical_image, 'uri', maxWidth, post.URL );
		}
		if ( post.attachments ) {
			forOwn( post.attachments, function( attachment ) {
				if ( startsWith( attachment.mime_type, 'image/' ) ) {
					makeImageURLSafe( attachment, 'URL', maxWidth, post.URL );
				}
			} );
		}

		return post;
	};
}
