/** @format */
/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import route from 'lib/route';
import feedStreamFactory from 'lib/feed-stream-store';
import {
	ensureStoreLoading,
	trackPageLoad,
	trackUpdatesLoaded,
	trackScrollPage,
} from 'reader/controller-helper';
import LikedPostsStream from 'reader/liked-stream/main';

const analyticsPageTitle = 'Reader';

const exported = {
	likes( context, next ) {
		const basePath = route.sectionify( context.path ),
			fullAnalyticsPageTitle = analyticsPageTitle + ' > My Likes',
			likedPostsStore = feedStreamFactory( 'likes' ),
			mcKey = 'postlike';

		ensureStoreLoading( likedPostsStore, context );

		trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );

		context.primary = React.createElement( LikedPostsStream, {
			key: 'liked',
			postsStore: likedPostsStore,
			trackScrollPage: trackScrollPage.bind(
				null,
				basePath,
				fullAnalyticsPageTitle,
				analyticsPageTitle,
				mcKey
			),
			onUpdatesShown: trackUpdatesLoaded.bind( null, mcKey ),
		} );
		next();
	},
};

export default exported;

export const { likes } = exported;
