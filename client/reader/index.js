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
	loadSubscriptions,
	preloadReaderBundle,
	prettyRedirects,
	readA8C,
	sidebar,
	updateLastRoute,
} from './controller';
import config from 'config';

function forceTeamA8C( context, next ) {
	context.params.team = 'a8c';
	next();
}

export default function() {
	if ( config.isEnabled( 'reader' ) ) {
		page( '/',
			preloadReaderBundle,
			loadSubscriptions,
			initAbTests,
			updateLastRoute,
			sidebar,
			following );

		// Old and incomplete paths that should be redirected to /
		page( '/read/following', '/' );
		page( '/read', '/' );
		page( '/read/blogs', '/' );
		page( '/read/feeds', '/' );
		page( '/read/blog', '/' );
		page( '/read/post', '/' );
		page( '/read/feed', '/' );

		// Feed stream
		page( '/read/*', preloadReaderBundle, loadSubscriptions, initAbTests );
		page( '/read/blog/feed/:feed_id', legacyRedirects );
		page( '/read/feeds/:feed_id/posts', incompleteUrlRedirects );
		page( '/read/feeds/:feed_id',
			updateLastRoute,
			prettyRedirects,
			sidebar,
			feedDiscovery,
			feedListing );

		// Blog stream
		page( '/read/blog/id/:blog_id', legacyRedirects );
		page( '/read/blogs/:blog_id/posts', incompleteUrlRedirects );
		page( '/read/blogs/:blog_id',
			updateLastRoute,
			prettyRedirects,
			sidebar,
			blogListing );
	}

	// Automattic Employee Posts
	page( '/read/a8c', updateLastRoute, sidebar, forceTeamA8C, readA8C );
};
