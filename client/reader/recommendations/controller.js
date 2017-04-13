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
import RecommendedForYou from 'reader/recommendations/for-you';
import RecommendedPostsStream from 'reader/recommendations/posts';
import route from 'lib/route';
import feedStreamFactory from 'lib/feed-stream-store';
import { renderWithReduxStore } from 'lib/react-helpers';

const ANALYTICS_PAGE_TITLE = 'Reader';

const exported = {
	recommendedForYou( context ) {
		const basePath = '/recommendations',
			fullAnalyticsPageTitle = ANALYTICS_PAGE_TITLE + ' > Recommended Sites For You',
			mcKey = 'recommendations_for_you';

		renderWithReduxStore(
			React.createElement( RecommendedForYou, {
				trackScrollPage: trackScrollPage.bind(
					null,
					basePath,
					fullAnalyticsPageTitle,
					ANALYTICS_PAGE_TITLE,
					mcKey
				)
			} ),
			document.getElementById( 'primary' ),
			context.store
		);

		trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );
		// FIXME: Auto-converted from the Flux setTitle action. Please use <DocumentHead> instead.
		context.store.dispatch( setTitle( i18n.translate( 'Recommended Sites For You ‹ Reader' ) ) );
	},

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
				showBack: userHasHistory( context )
			} ),
			document.getElementById( 'primary' ),
			context.store
		);
	}
};

export default exported;

export const {
    recommendedForYou,
    recommendedPosts
} = exported;
