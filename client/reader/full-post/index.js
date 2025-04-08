import page from '@automattic/calypso-router';
import { makeLayout, redirectLoggedOutToSignup, render as clientRender } from 'calypso/controller';
import { blogDiscoveryByFeedId } from 'calypso/reader/controller';
import { blogPost, feedPost } from './controller';

export default function () {
	// Feed full post
	page(
		'/reader/feeds/:feed/posts/:post',
		blogDiscoveryByFeedId,
		redirectLoggedOutToSignup,
		feedPost,
		makeLayout,
		clientRender
	);

	// Blog full post
	page(
		'/reader/blogs/:blog/posts/:post',
		redirectLoggedOutToSignup,
		blogPost,
		makeLayout,
		clientRender
	);
}
