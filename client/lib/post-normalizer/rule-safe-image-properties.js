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
		if ( post.feed_ID === 12098 || +post.site_ID === 1065188 ) {
			post.featured_image = '';
			delete post.post_thumbnail;
		}
		makeImageURLSafe( post, 'featured_image', maxWidth, post.URL );
		if ( post.post_thumbnail ) {
			makeImageURLSafe( post.post_thumbnail, 'URL', maxWidth, post.URL );
		}
		if ( post.featured_media && post.featured_media.type === 'image' ) {
			makeImageURLSafe( post.featured_media, 'uri', maxWidth, post.URL );
		}
		if ( post.canonical_image && post.canonical_image.uri ) {
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
