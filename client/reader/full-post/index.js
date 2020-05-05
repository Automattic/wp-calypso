/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { blogPost, feedPost } from './controller';
import { updateLastRoute, unmountSidebar } from 'reader/controller';
import { makeLayout, render as clientRender } from 'controller';

export default function () {
	// Feed full post
	page(
		'/read/feeds/:feed/posts/:post',
		updateLastRoute,
		unmountSidebar,
		feedPost,
		makeLayout,
		clientRender
	);

	// Blog full post
	page(
		'/read/blogs/:blog/posts/:post',
		updateLastRoute,
		unmountSidebar,
		blogPost,
		makeLayout,
		clientRender
	);
}
