import page from '@automattic/calypso-router';
import { makeLayout, redirectLoggedOutToSignup, render as clientRender } from 'calypso/controller';
import { updateLastRoute, blogDiscoveryByFeedId, sidebar } from 'calypso/reader/controller';
import { blogPost, feedPost } from './controller';

export default function () {
	// Feed full post
	page(
		'/read/feeds/:feed/posts/:post',
		blogDiscoveryByFeedId,
		redirectLoggedOutToSignup,
		updateLastRoute,
		sidebar,
		feedPost,
		makeLayout,
		clientRender
	);

	// Blog full post
	page(
		'/read/blogs/:blog/posts/:post',
		redirectLoggedOutToSignup,
		updateLastRoute,
		sidebar,
		blogPost,
		makeLayout,
		clientRender
	);
}
