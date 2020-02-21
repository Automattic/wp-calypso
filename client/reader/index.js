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
	sidebar,
	updateLastRoute,
	makeLayout,
} from './controller';
import config from 'config';
import { render as clientRender } from 'controller';
import { setSection } from 'controller/shared';

/**
 * Style dependencies
 */
import './style.scss';

function forceTeamA8C( context, next ) {
	context.params.team = 'a8c';
	next();
}

export const READER_READ_DEFINITION = {
	name: 'reader',
	paths: [ '/', '/read' ],
	module: 'reader',
	secondary: true,
	group: 'reader',
};

export const READER_FEEDS_DEFINITION = {
	name: 'reader',
	paths: [ '/read/feeds/[^\\/]+', '/read/blogs/[^\\/]+', '/read/a8c' ],
	module: 'reader',
	secondary: true,
	group: 'reader',
};

export const READER_FULL_POST_DEFINITION = {
	name: 'reader',
	paths: [ '/read/feeds/[^\\/]+/posts/[^\\/]+', '/read/blogs/[^\\/]+/posts/[^\\/]+' ],
	module: 'reader/full-post',
	secondary: false,
	group: 'reader',
};

export const READER_DISCOVER_DEFINITION = {
	name: 'reader',
	paths: [ '/discover' ],
	module: 'reader/discover',
	secondary: true,
	group: 'reader',
};

export const READER_FOLLOWING_DEFINITION = {
	name: 'reader',
	paths: [ '/following' ],
	module: 'reader/following',
	secondary: true,
	group: 'reader',
};

export const READER_TAGS_DEFINITION = {
	name: 'reader',
	paths: [ '/tags', '/tag' ],
	module: 'reader/tag-stream',
	secondary: true,
	group: 'reader',
};

export const READER_ACTIVITIES_DEFINITION = {
	name: 'reader',
	paths: [ '/activities' ],
	module: 'reader/liked-stream',
	secondary: true,
	group: 'reader',
};

export const READER_SEARCH_DEFINITION = {
	name: 'reader',
	paths: [ '/read/search', '/recommendations' ],
	module: 'reader/search',
	secondary: true,
	group: 'reader',
};

export const READER_LIST_DEFINITION = {
	name: 'reader',
	paths: [ '/read/list' ],
	module: 'reader/list',
	secondary: true,
	group: 'reader',
};

export const READER_CONVERSATIONS_DEFINITION = {
	name: 'reader',
	paths: [ '/read/conversations' ],
	module: 'reader/conversations',
	secondary: true,
	group: 'reader',
};

export const READER_SECTION_DEFINITIONS = [
	// this MUST be the first section for /read paths so subsequent sections under /read can override settings
	READER_READ_DEFINITION,
	READER_FEEDS_DEFINITION,
	READER_FULL_POST_DEFINITION,
	READER_DISCOVER_DEFINITION,
	READER_FOLLOWING_DEFINITION,
	READER_TAGS_DEFINITION,
	READER_ACTIVITIES_DEFINITION,
	READER_SEARCH_DEFINITION,
	READER_LIST_DEFINITION,
	READER_CONVERSATIONS_DEFINITION,
];

export default function() {
	if ( config.isEnabled( 'reader' ) ) {
		page(
			'/read',
			preloadReaderBundle,
			initAbTests,
			updateLastRoute,
			sidebar,
			setSection( READER_READ_DEFINITION ),
			following,
			makeLayout,
			clientRender
		);

		// Old and incomplete paths that should be redirected to /
		page( '/read/following', '/read' );
		page( '/read/blogs', '/read' );
		page( '/read/feeds', '/read' );
		page( '/read/blog', '/read' );
		page( '/read/post', '/read' );
		page( '/read/feed', '/read' );

		// Feed stream
		page( '/read/*', preloadReaderBundle, initAbTests );
		page( '/read/blog/feed/:feed_id', legacyRedirects );
		page( '/read/feeds/:feed_id/posts', incompleteUrlRedirects );
		page(
			'/read/feeds/:feed_id',
			updateLastRoute,
			prettyRedirects,
			sidebar,
			feedDiscovery,
			feedListing,
			setSection( READER_FEEDS_DEFINITION ),
			makeLayout,
			clientRender
		);

		// Blog stream
		page( '/read/blog/id/:blog_id', legacyRedirects );
		page( '/read/blogs/:blog_id/posts', incompleteUrlRedirects );
		page(
			'/read/blogs/:blog_id',
			updateLastRoute,
			prettyRedirects,
			sidebar,
			setSection( READER_FEEDS_DEFINITION ),
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
		updateLastRoute,
		sidebar,
		forceTeamA8C,
		setSection( READER_FEEDS_DEFINITION ),
		readA8C,
		makeLayout,
		clientRender
	);
}
