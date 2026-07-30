import { makeLayout, redirectLoggedOutToSignup, render as clientRender } from 'calypso/controller';
import { blogDiscoveryByFeedId, sidebar } from 'calypso/reader/controller';
import { readerPage } from 'calypso/reader/lib/reader-router';
import { blogPost, feedPost } from './controller';

export default function () {
	// Feed full post
	readerPage(
		'/reader/feeds/:feed/posts/:post',
		blogDiscoveryByFeedId,
		redirectLoggedOutToSignup,
		sidebar,
		feedPost,
		makeLayout,
		clientRender
	);

	// Blog full post
	readerPage(
		'/reader/blogs/:blog/posts/:post',
		redirectLoggedOutToSignup,
		sidebar,
		blogPost,
		makeLayout,
		clientRender
	);
}
