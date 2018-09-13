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
	communityEvents,
	feedDiscovery,
	feedListing,
	following,
	incompleteUrlRedirects,
	initAbTests,
	legacyRedirects,
	preloadReaderBundle,
	prettyRedirects,
	readA8C,
	sidebar,
	updateLastRoute,
} from './controller';
import config from 'config';
import { makeLayout, redirectLoggedOut, render as clientRender } from 'controller';

function forceTeamA8C( context, next ) {
	context.params.team = 'a8c';
	next();
}

export default function() {
	if ( config.isEnabled( 'reader' ) ) {
		page(
			'/',
			preloadReaderBundle,
			initAbTests,
			updateLastRoute,
			sidebar,
			following,
			makeLayout,
			clientRender
		);

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
			redirectLoggedOut,
			updateLastRoute,
			prettyRedirects,
			sidebar,
			feedDiscovery,
			feedListing,
			makeLayout,
			clientRender
		);

		// Blog stream
		page( '/read/blog/id/:blog_id', legacyRedirects );
		page( '/read/blogs/:blog_id/posts', incompleteUrlRedirects );
		page(
			'/read/blogs/:blog_id',
			redirectLoggedOut,
			updateLastRoute,
			prettyRedirects,
			sidebar,
			blogListing,
			makeLayout,
			clientRender
		);

		// Old full post view
		page( '/read/post/feed/:feed_id/:post_id', legacyRedirects );
		page( '/read/post/id/:blog_id/:post_id', legacyRedirects );

		// old recommendations page
		page( '/recommendations', '/read/search' );
	}

	// Automattic Employee Posts
	page(
		'/read/a8c',
		redirectLoggedOut,
		updateLastRoute,
		sidebar,
		forceTeamA8C,
		readA8C,
		makeLayout,
		clientRender
	);

	if ( config.isEnabled( 'reader/community-events' ) ) {
		page(
			'/read/community-events',
			redirectLoggedOut,
			updateLastRoute,
			prettyRedirects,
			sidebar,
			communityEvents,
			makeLayout,
			clientRender
		);
	}
}
