import { makeImageURLSafe } from './utils';

export default function safeImagePropertiesForWidth( maxWidth ) {
	return function safeImageProperties( post ) {
		makeImageURLSafe( post.author, 'avatar_URL', maxWidth );

		const hadFeaturedImage = !! post.featured_image;
		makeImageURLSafe( post, 'featured_image', maxWidth, post.URL );
		if ( post.post_thumbnail ) {
			makeImageURLSafe( post.post_thumbnail, 'URL', maxWidth, post.URL );
		}

		// safeImageUrl() returns null for external image URLs that carry a
		// non-resize query string (e.g. `?wsr` from WebP-delivery plugins). When
		// that strips a featured image we'd otherwise show, fall back to the
		// Reader API's separate post_thumbnail, which the mobile apps already use.
		if ( hadFeaturedImage && ! post.featured_image && post.post_thumbnail?.URL ) {
			post.featured_image = post.post_thumbnail.URL;
		}
		if ( post.featured_media && post.featured_media.type === 'image' ) {
			makeImageURLSafe( post.featured_media, 'uri', maxWidth, post.URL );
		}
		if ( post.canonical_image && post.canonical_image.uri ) {
			makeImageURLSafe( post.canonical_image, 'uri', maxWidth, post.URL );
		}
		if ( post.attachments ) {
			Object.values( post.attachments ).forEach( function ( attachment ) {
				if ( ( attachment.mime_type ?? '' ).startsWith( 'image/' ) ) {
					makeImageURLSafe( attachment, 'URL', maxWidth, post.URL );
				}
			} );
		}

		return post;
	};
}
