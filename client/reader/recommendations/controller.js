/**
 * External dependencies
 */
import React from 'react';
import ReactDom from 'react-dom';

/**
 * Internal dependencies
 */
import trackScrollPage from 'lib/track-scroll-page';
import titleActions from 'lib/screen-title/actions';
import i18n from 'lib/mixins/i18n';
import { ensureStoreLoading, trackPageLoad, trackUpdatesLoaded, setPageTitle } from 'reader/controller-helper';
import route from 'lib/route';
import feedStreamFactory from 'lib/feed-stream-store';

const ANALYTICS_PAGE_TITLE = 'Reader';

function userHasHistory( context ) {
	return !! context.lastRoute;
}

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
		var WarmstartStream = require( 'reader/recommendations/posts' ),
			basePath = route.sectionify( context.path ),
			fullAnalyticsPageTitle = ANALYTICS_PAGE_TITLE + ' > Warmstart',
			warmstartPostsStore = feedStreamFactory( 'warmstart' ),
			mcKey = 'warmstart';

		ensureStoreLoading( warmstartPostsStore, context );

		trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );

		ReactDom.render(
			React.createElement( WarmstartStream, {
				key: 'warmstart',
				store: warmstartPostsStore,
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
