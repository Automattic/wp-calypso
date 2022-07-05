import page from 'page';
import { makeLayout, redirectLoggedOut, render as clientRender } from 'calypso/controller';
import { updateLastRoute, unmountSidebar, blogDiscoveryByFeedId } from 'calypso/reader/controller';
import { blogPost, feedPost } from './controller';

export default function () {
	// Feed full post
	page(
		'/read/feeds/:feed/posts/:post',
		blogDiscoveryByFeedId,
		redirectLoggedOut,
		updateLastRoute,
		unmountSidebar,
		feedPost,
		makeLayout,
		clientRender
	);

	// Blog full post
	page(
		'/read/blogs/:blog/posts/:post',
		redirectLoggedOut,
		updateLastRoute,
		unmountSidebar,
		blogPost,
		makeLayout,
		clientRender
	);
}
