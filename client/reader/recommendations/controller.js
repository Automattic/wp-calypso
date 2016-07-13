/**
 * External dependencies
 */
import React from 'react';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import trackScrollPage from 'lib/track-scroll-page';
import titleActions from 'lib/screen-title/actions';
import { ensureStoreLoading, trackPageLoad, trackUpdatesLoaded, setPageTitle, userHasHistory } from 'reader/controller-helper';
import route from 'lib/route';
import feedStreamFactory from 'lib/feed-stream-store';
import { renderWithReduxStore } from 'lib/react-helpers';

const ANALYTICS_PAGE_TITLE = 'Reader';

export default {
	recommendedForYou( context ) {
		const RecommendedForYou = require( 'reader/recommendations/for-you' ),
			basePath = '/recommendations',
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
		titleActions.setTitle( i18n.translate( 'Recommended Sites For You ‹ Reader' ) );
	},

	// Post Recommendations - Used by the Data team to test recommendation algorithms
	recommendedPosts( context ) {
		var RecommendedPostsStream = require( 'reader/recommendations/posts' ),
			basePath = route.sectionify( context.path ),
			fullAnalyticsPageTitle = ANALYTICS_PAGE_TITLE + ' > Recommended Posts',
			RecommendedPostsStore = feedStreamFactory( 'recommendations_posts' ),
			mcKey = 'recommendations_posts';

		ensureStoreLoading( RecommendedPostsStore, context );

		trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );

		renderWithReduxStore(
			React.createElement( RecommendedPostsStream, {
				key: 'recommendations_posts',
				store: RecommendedPostsStore,
				setPageTitle: setPageTitle,
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
