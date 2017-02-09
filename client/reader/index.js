/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import {
	loadSubscriptions,
	initAbTests,
	updateLastRoute,
	sidebar,
	following,
	legacyRedirects,
	incompleteUrlRedirects,
	prettyRedirects,
	readA8C,
	blogListing,
	feedDiscovery,
	feedListing,
	recommendedForYou,
	feedPost,
	unmountSidebar,
	discover,
	recommendedPosts,
	blogPost,
	search,
	listListing,
	tagListing,
	followingEdit,
	likes,
} from './controller';
import config from 'config';
import { forEach } from 'lodash';

function forceTeamA8C( context, next ) {
	context.params.team = 'a8c';
	next();
}

export default function() {
	if ( config.isEnabled( 'reader' ) ) {
		page( '/',
			loadSubscriptions,
			initAbTests,
			updateLastRoute,
			sidebar,
			following,
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
		page( '/read/*', loadSubscriptions, initAbTests );
		page( '/read/blog/feed/:feed_id', legacyRedirects );
		page( '/read/feeds/:feed_id/posts', incompleteUrlRedirects );
		page( '/read/feeds/:feed_id',
			updateLastRoute,
			prettyRedirects,
			sidebar,
			feedDiscovery,
			feedListing,
		);

		// Blog stream
		page( '/read/blog/id/:blog_id', legacyRedirects );
		page( '/read/blogs/:blog_id/posts', incompleteUrlRedirects );
		page( '/read/blogs/:blog_id',
			updateLastRoute,
			prettyRedirects,
			sidebar,
			blogListing,
		);
	}

	// Automattic Employee Posts
	page( '/read/a8c',
		updateLastRoute,
		sidebar,
		forceTeamA8C,
		readA8C,
	);

	page( '/tag/*',
		loadSubscriptions,
		initAbTests,
	);
	page( '/tag/:tag',
		updateLastRoute,
		sidebar,
		tagListing,
	);
	page( '/tags',
		loadSubscriptions,
		initAbTests,
		updateLastRoute,
		sidebar,
	);

	page( '/read/post/feed/:feed_id/:post_id', legacyRedirects );
	page( '/read/feeds/:feed/posts/:post',
		updateLastRoute,
		unmountSidebar,
		feedPost,
	);

	page( '/read/post/id/:blog_id/:post_id', legacyRedirects );
	page( '/read/blogs/:blog/posts/:post',
		updateLastRoute,
		unmountSidebar,
		blogPost,
	);

	page( '/recommendations',
		loadSubscriptions,
		initAbTests,
		updateLastRoute,
		sidebar,
		recommendedForYou
	);

	// Post Recommendations - Used by the Data team to test recommendation algorithms
	if ( config.isEnabled( 'reader/recommendations/posts' ) ) {
		forEach( [ '/recommendations/posts', '/recommendations/cold', '/recommendations/cold1w', '/recommendations/cold2w', '/recommendations/cold4w', '/recommendations/coldtopics' ],
			( path ) => {
				page.apply( page, [
					path,
					loadSubscriptions,
					updateLastRoute,
					sidebar,
					recommendedPosts
				] );
			}
		);
	}

	page( '/discover',
		updateLastRoute,
		loadSubscriptions,
		initAbTests,
		sidebar,
		discover
	);

	page( '/following/*',
		loadSubscriptions,
		initAbTests,
	);
	page( '/following/edit',
		updateLastRoute,
		sidebar,
		followingEdit,
	);

	page( '/activities/likes',
		loadSubscriptions,
		initAbTests,
		updateLastRoute,
		sidebar,
		likes,
	);

	page( '/read/search',
		updateLastRoute,
		sidebar,
		search,
	);

	page( '/read/list/:user/:list',
		updateLastRoute,
		sidebar,
		listListing,
	);
}
