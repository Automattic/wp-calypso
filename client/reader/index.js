/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import controller from './controller';
import config from 'config';

function forceTeamA8C( context, next ) {
	context.params.team = 'a8c';
	next();
}

module.exports = function() {
	if ( config.isEnabled( 'reader' ) ) {
		page( '/',
			controller.preloadReaderBundle,
			controller.loadSubscriptions,
			controller.checkForColdStart,
			controller.initAbTests,
			controller.updateLastRoute,
			controller.removePost,
			controller.sidebar,
			controller.following );

		// Old and incomplete paths that should be redirected to /
		page( '/read/following', '/' );
		page( '/read', '/' );
		page( '/read/blogs', '/' );
		page( '/read/feeds', '/' );
		page( '/read/blog', '/' );
		page( '/read/post', '/' );
		page( '/read/feed', '/' );

		// Feed stream
		page( '/read/*', controller.preloadReaderBundle, controller.loadSubscriptions, controller.initAbTests );
		page( '/read/blog/feed/:feed_id', controller.legacyRedirects );
		page( '/read/feeds/:feed_id/posts', controller.incompleteUrlRedirects );
		page( '/read/feeds/:feed_id',
			controller.updateLastRoute,
			controller.prettyRedirects,
			controller.removePost,
			controller.sidebar,
			controller.feedDiscovery,
			controller.feedListing );

		// Blog stream
		page( '/read/blog/id/:blog_id', controller.legacyRedirects );
		page( '/read/blogs/:blog_id/posts', controller.incompleteUrlRedirects );
		page( '/read/blogs/:blog_id',
			controller.updateLastRoute,
			controller.prettyRedirects,
			controller.removePost,
			controller.sidebar,
			controller.blogListing );
	}

	// Automattic Employee Posts
	page( '/read/a8c', controller.updateLastRoute, controller.removePost, controller.sidebar, forceTeamA8C, controller.readA8C );
};
