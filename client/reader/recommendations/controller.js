/**
 * External dependencies
 */
import React from 'react';
import ReactDom from 'react-dom';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import trackScrollPage from 'lib/track-scroll-page';
import titleActions from 'lib/screen-title/actions';
import { ensureStoreLoading, trackPageLoad, trackUpdatesLoaded, setPageTitle, userHasHistory } from 'reader/controller-helper';
import route from 'lib/route';
import feedStreamFactory from 'lib/feed-stream-store';

const ANALYTICS_PAGE_TITLE = 'Reader';

export default {
	recommendedForYou() {
		const RecommendedForYou = require( 'reader/recommendations/for-you' ),
			basePath = '/recommendations',
			fullAnalyticsPageTitle = ANALYTICS_PAGE_TITLE + ' > Recommended Sites For You',
			mcKey = 'recommendations_for_you';

		ReactDom.render(
			React.createElement( RecommendedForYou, {
				trackScrollPage: trackScrollPage.bind(
					null,
					basePath,
					fullAnalyticsPageTitle,
					ANALYTICS_PAGE_TITLE,
					mcKey
				)
			} ),
			document.getElementById( 'primary' )
		);

		trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );
		titleActions.setTitle( i18n.translate( 'Recommended Sites For You ‹ Reader' ) );
	},

	// Post Recommendations - Used by the Data team to test recommendation algorithms
	recommendedPosts( context ) {
		const RecommendedPostsStream = require( 'reader/recommendations/posts' ),
			basePath = route.sectionify( context.path );

		const fullAnalyticsPageTitle = ( '/recommendations/posts' === basePath )
			? ANALYTICS_PAGE_TITLE + ' > Recommended Posts'
			: ANALYTICS_PAGE_TITLE + ' > Coldstart Posts';

		const RecommendedPostsStore = ( '/recommendations/posts' === basePath )
			? feedStreamFactory( 'recommendations_posts' )
			: feedStreamFactory( 'coldstart_posts' );

		const mcKey = ( '/recommendations/posts' === basePath )
			? 'recommendations_posts'
			: 'coldstart_posts';

		ensureStoreLoading( RecommendedPostsStore, context );

		trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );

		ReactDom.render(
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
			document.getElementById( 'primary' )
		);
	}
};
