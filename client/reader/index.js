/** @format */
/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import {
	blogListing,
	feedDiscovery,
	feedListing,
	following,
	incompleteUrlRedirects,
	initAbTests,
	legacyRedirects,
	preloadReaderBundle,
	prettyRedirects,
	readA8C,
	unmountSidebar,
	updateLastRoute,
} from './controller';
import config from 'config';

function forceTeamA8C( context, next ) {
	context.params.team = 'a8c';
	next();
}

export default function() {
	if ( config.isEnabled( 'reader' ) ) {
		page( '/', preloadReaderBundle, initAbTests, updateLastRoute, unmountSidebar, following );

		// Old and incomplete paths that should be redirected to /
		page( '/read/following', '/' );
		page( '/read', '/' );
		page( '/read/blogs', '/' );
		page( '/read/feeds', '/' );
		page( '/read/blog', '/' );
		page( '/read/post', '/' );
		page( '/read/feed', '/' );

		// Feed stream
		page( '/read/*', preloadReaderBundle, initAbTests );
		page( '/read/blog/feed/:feed_id', legacyRedirects );
		page( '/read/feeds/:feed_id/posts', incompleteUrlRedirects );
		page(
			'/read/feeds/:feed_id',
			updateLastRoute,
			prettyRedirects,
			unmountSidebar,
			feedDiscovery,
			feedListing
		);

		// Blog stream
		page( '/read/blog/id/:blog_id', legacyRedirects );
		page( '/read/blogs/:blog_id/posts', incompleteUrlRedirects );
		page( '/read/blogs/:blog_id', updateLastRoute, prettyRedirects, unmountSidebar, blogListing );

		// Old full post view
		page( '/read/post/feed/:feed_id/:post_id', legacyRedirects );
		page( '/read/post/id/:blog_id/:post_id', legacyRedirects );
	}

	// Automattic Employee Posts
	page( '/read/a8c', updateLastRoute, unmountSidebar, forceTeamA8C, readA8C );
}
