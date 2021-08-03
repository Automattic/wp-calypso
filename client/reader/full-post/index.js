import page from 'page';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { updateLastRoute, unmountSidebar } from 'calypso/reader/controller';
import { blogPost, feedPost } from './controller';

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
