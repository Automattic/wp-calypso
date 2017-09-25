/** @format */
/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import feedStreamFactory from 'lib/feed-stream-store';
import { renderWithReduxStore } from 'lib/react-helpers';
import route from 'lib/route';
import trackScrollPage from 'lib/track-scroll-page';
import { ensureStoreLoading, trackPageLoad, trackUpdatesLoaded, userHasHistory } from 'reader/controller-helper';
import RecommendedPostsStream from 'reader/recommendations/posts';

const ANALYTICS_PAGE_TITLE = 'Reader';

const exported = {
	// Post Recommendations - Used by the Data team to test recommendation algorithms
	recommendedPosts( context ) {
		const basePath = route.sectionify( context.path );

		let fullAnalyticsPageTitle = '';
		let RecommendedPostsStore = null;
		let mcKey = '';
		switch ( basePath ) {
			case '/recommendations/cold':
				fullAnalyticsPageTitle = ANALYTICS_PAGE_TITLE + ' > Coldstart Posts';
				RecommendedPostsStore = feedStreamFactory( 'cold_posts' );
				mcKey = 'coldstart_posts';
				break;
			case '/recommendations/cold1w':
				fullAnalyticsPageTitle = ANALYTICS_PAGE_TITLE + ' > Coldstart+1w Posts';
				RecommendedPostsStore = feedStreamFactory( 'cold_posts_1w' );
				mcKey = 'coldstart_posts_1w';
				break;
			case '/recommendations/cold2w':
				fullAnalyticsPageTitle = ANALYTICS_PAGE_TITLE + ' > Coldstart+2w Posts';
				RecommendedPostsStore = feedStreamFactory( 'cold_posts_2w' );
				mcKey = 'coldstart_posts_2w';
				break;
			case '/recommendations/cold4w':
				fullAnalyticsPageTitle = ANALYTICS_PAGE_TITLE + ' > Coldstart+4w Posts';
				RecommendedPostsStore = feedStreamFactory( 'cold_posts_4w' );
				mcKey = 'coldstart_posts_4w';
				break;
			case '/recommendations/coldtopics':
				fullAnalyticsPageTitle = ANALYTICS_PAGE_TITLE + ' > Coldstart Diverse Posts';
				RecommendedPostsStore = feedStreamFactory( 'cold_posts_topics' );
				mcKey = 'coldstart_posts_topics';
				break;
			default:
				fullAnalyticsPageTitle = ANALYTICS_PAGE_TITLE + ' > Recommended Posts';
				RecommendedPostsStore = feedStreamFactory( 'custom_recs_posts_with_images' );
				mcKey = 'custom_recs_posts_with_images';
		}

		ensureStoreLoading( RecommendedPostsStore, context );

		trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );

		renderWithReduxStore(
			React.createElement( RecommendedPostsStream, {
				key: 'recommendations_posts',
				postsStore: RecommendedPostsStore,
				trackScrollPage: trackScrollPage.bind(
					null,
					basePath,
					fullAnalyticsPageTitle,
					ANALYTICS_PAGE_TITLE,
					mcKey
				),
				onUpdatesShown: trackUpdatesLoaded.bind( null, mcKey ),
				showBack: userHasHistory( context ),
			} ),
			document.getElementById( 'primary' ),
			context.store
		);
	},
};

export default exported;

export const { recommendedPosts } = exported;
