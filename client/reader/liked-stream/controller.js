/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import route from 'lib/route';
import feedStreamFactory from 'lib/feed-stream-store';
import { ensureStoreLoading, trackPageLoad, trackUpdatesLoaded, trackScrollPage } from 'reader/controller-helper';
import { renderWithReduxStore } from 'lib/react-helpers';

const analyticsPageTitle = 'Reader';

export default {
	likes( context ) {
		var LikedPostsStream = require( 'reader/liked-stream/main' ),
			basePath = route.sectionify( context.path ),
			fullAnalyticsPageTitle = analyticsPageTitle + ' > My Likes',
			likedPostsStore = feedStreamFactory( 'likes' ),
			mcKey = 'postlike';

		ensureStoreLoading( likedPostsStore, context );

		trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );

		renderWithReduxStore(
			React.createElement( LikedPostsStream, {
				key: 'liked',
				postsStore: likedPostsStore,
				trackScrollPage: trackScrollPage.bind(
					null,
					basePath,
					fullAnalyticsPageTitle,
					analyticsPageTitle,
					mcKey
				),
				onUpdatesShown: trackUpdatesLoaded.bind( null, mcKey )
			} ),
			document.getElementById( 'primary' ),
			context.store
		);
	}
};
