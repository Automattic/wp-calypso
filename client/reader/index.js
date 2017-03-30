/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import controller from './controller';
import config from 'config';

import { makeLayout, render as clientRender } from 'controller';

function forceTeamA8C( context, next ) {
	context.params.team = 'a8c';
	next();
}

module.exports = function() {
	if ( config.isEnabled( 'reader' ) ) {
		page(
		    '/',
			controller.preloadReaderBundle,
			controller.loadSubscriptions,
			controller.initAbTests,
			controller.updateLastRoute,
			controller.sidebar,
			controller.following,
			makeLayout,
			clientRender
		);

		// Old and incomplete paths that should be redirected to /
		page('/read/following', '/', makeLayout, clientRender);
		page('/read', '/', makeLayout, clientRender);
		page('/read/blogs', '/', makeLayout, clientRender);
		page('/read/feeds', '/', makeLayout, clientRender);
		page('/read/blog', '/', makeLayout, clientRender);
		page('/read/post', '/', makeLayout, clientRender);
		page('/read/feed', '/', makeLayout, clientRender);

		// Feed stream
		page(
		    '/read/*',
			controller.preloadReaderBundle,
			controller.loadSubscriptions,
			controller.initAbTests,
			makeLayout,
			clientRender
		);
		page(
		    '/read/blog/feed/:feed_id',
			controller.legacyRedirects,
			makeLayout,
			clientRender
		);
		page(
		    '/read/feeds/:feed_id/posts',
			controller.incompleteUrlRedirects,
			makeLayout,
			clientRender
		);
		page(
		    '/read/feeds/:feed_id',
			controller.updateLastRoute,
			controller.prettyRedirects,
			controller.sidebar,
			controller.feedDiscovery,
			controller.feedListing,
			makeLayout,
			clientRender
		);

		// Blog stream
		page(
		    '/read/blog/id/:blog_id',
			controller.legacyRedirects,
			makeLayout,
			clientRender
		);
		page(
		    '/read/blogs/:blog_id/posts',
			controller.incompleteUrlRedirects,
			makeLayout,
			clientRender
		);
		page(
		    '/read/blogs/:blog_id',
			controller.updateLastRoute,
			controller.prettyRedirects,
			controller.sidebar,
			controller.blogListing,
			makeLayout,
			clientRender
		);
	}

	// Automattic Employee Posts
	page(
	    '/read/a8c',
		controller.updateLastRoute,
		controller.sidebar,
		forceTeamA8C,
		controller.readA8C,
		makeLayout,
		clientRender
	);
};
