import page from '@automattic/calypso-router';
import { makeLayout, redirectLoggedOutToSignup, render as clientRender } from 'calypso/controller';
import { updateLastRoute, blogDiscoveryByFeedId } from 'calypso/reader/controller';
import { blogPost, feedPost } from './controller';

export default function () {
	// Feed full post
	page(
		'/reader/feeds/:feed/posts/:post',
		blogDiscoveryByFeedId,
		redirectLoggedOutToSignup,
		updateLastRoute,
		feedPost,
		makeLayout,
		clientRender
	);

	// Blog full post
	page(
		'/reader/blogs/:blog/posts/:post',
		redirectLoggedOutToSignup,
		updateLastRoute,
		blogPost,
		makeLayout,
		clientRender
	);
}
