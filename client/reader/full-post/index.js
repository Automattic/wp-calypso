/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { blogPost, feedPost } from './controller';
import readerController from 'reader/controller';

import { makeLayout, render as clientRender } from 'controller';

export default function() {
	// Feed full post
	page(
	 '/read/post/feed/:feed_id/:post_id',
	 readerController.legacyRedirects,
	 makeLayout,
	 clientRender
	);
	page(
	 '/read/feeds/:feed/posts/:post',
	 readerController.updateLastRoute,
	 readerController.unmountSidebar,
	 feedPost,
	 makeLayout,
	 clientRender
	);

	// Blog full post
	page(
	 '/read/post/id/:blog_id/:post_id',
	 readerController.legacyRedirects,
	 makeLayout,
	 clientRender
	);
	page(
	 '/read/blogs/:blog/posts/:post',
	 readerController.updateLastRoute,
	 readerController.unmountSidebar,
	 blogPost,
	 makeLayout,
	 clientRender
	);
}
