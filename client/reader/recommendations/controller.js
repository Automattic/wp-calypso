/**
 * External dependencies
 */
import React from 'react';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import trackScrollPage from 'lib/track-scroll-page';
import { setDocumentHeadTitle as setTitle } from 'state/document-head/actions';
import { ensureStoreLoading, trackPageLoad, trackUpdatesLoaded, userHasHistory } from 'reader/controller-helper';
import route from 'lib/route';
import feedStreamFactory from 'lib/feed-stream-store';

const ANALYTICS_PAGE_TITLE = 'Reader';

export default {
	recommendedForYou(context, next) {
	    const RecommendedForYou = require( 'reader/recommendations/for-you' ),
			basePath = '/recommendations',
			fullAnalyticsPageTitle = ANALYTICS_PAGE_TITLE + ' > Recommended Sites For You',
			mcKey = 'recommendations_for_you';

		context.primary = React.createElement( RecommendedForYou, {
			trackScrollPage: trackScrollPage.bind(
				null,
				basePath,
				fullAnalyticsPageTitle,
				ANALYTICS_PAGE_TITLE,
				mcKey
			)
		} );

		trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );
		// FIXME: Auto-converted from the Flux setTitle action. Please use <DocumentHead> instead.
		context.store.dispatch( setTitle( i18n.translate( 'Recommended Sites For You ‹ Reader' ) ) );
		next();
	},

	// Post Recommendations - Used by the Data team to test recommendation algorithms
	recommendedPosts(context, next) {
	    const RecommendedPostsStream = require( 'reader/recommendations/posts' ),
			basePath = route.sectionify( context.path );

		let fullAnalyticsPageTitle = '';
		let RecommendedPostsStore = null;
		let mcKey = '';
		switch( basePath ) {
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

		context.primary = React.createElement( RecommendedPostsStream, {
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
			showBack: userHasHistory( context )
		} );
		next();
	}
};
