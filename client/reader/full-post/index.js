/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { blogPost, feedPost } from './controller';
import {
	legacyRedirects,
	updateLastRoute,
	unmountSidebar,
} from 'reader/controller';

export default function() {
	// Feed full post
	page( '/read/post/feed/:feed_id/:post_id', legacyRedirects );
	page( '/read/feeds/:feed/posts/:post',
		updateLastRoute,
		unmountSidebar,
		feedPost );

	// Blog full post
	page( '/read/post/id/:blog_id/:post_id', legacyRedirects );
	page( '/read/blogs/:blog/posts/:post',
		updateLastRoute,
		unmountSidebar,
		blogPost );
}
