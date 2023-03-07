import page from 'page';
import { makeLayout, redirectLoggedOutToSignup, render as clientRender } from 'calypso/controller';
import { updateLastRoute, unmountSidebar, blogDiscoveryByFeedId } from 'calypso/reader/controller';
import { blogPost, feedPost } from './controller';

export default function () {
	// Feed full post
	page(
		'/read/feeds/:feed/posts/:post',
		blogDiscoveryByFeedId,
		redirectLoggedOutToSignup,
		updateLastRoute,
		unmountSidebar,
		feedPost,
		makeLayout,
		clientRender
	);

	// Blog full post
	page(
		'/read/blogs/:blog/posts/:post',
		redirectLoggedOutToSignup,
		updateLastRoute,
		unmountSidebar,
		blogPost,
		makeLayout,
		clientRender
	);
}
