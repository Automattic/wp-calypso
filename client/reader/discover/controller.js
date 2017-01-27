/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import config from 'config';
import route from 'lib/route';
import feedStreamFactory from 'lib/feed-stream-store';
import { recordTrack } from 'reader/stats';
import { ensureStoreLoading, trackPageLoad, trackUpdatesLoaded, trackScrollPage } from 'reader/controller-helper';
import { renderWithReduxStore } from 'lib/react-helpers';

const ANALYTICS_PAGE_TITLE = 'Reader';

export default {
	discover( context ) {
		const blogId = config( 'discover_blog_id' ),
			SiteStream = require( 'reader/site-stream' ),
			basePath = route.sectionify( context.path ),
			fullAnalyticsPageTitle = ANALYTICS_PAGE_TITLE + ' > Site > ' + blogId,
			feedStore = feedStreamFactory( 'site:' + blogId ),
			mcKey = 'discover';

		ensureStoreLoading( feedStore, context );

		trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );
		recordTrack( 'calypso_reader_discover_viewed' );

		renderWithReduxStore(
			React.createElement( SiteStream, {
				key: 'site-' + blogId,
				postsStore: feedStore,
				siteId: +blogId,
				title: 'Discover',
				trackScrollPage: trackScrollPage.bind(
					null,
					basePath,
					fullAnalyticsPageTitle,
					ANALYTICS_PAGE_TITLE,
					mcKey
				),
				onUpdatesShown: trackUpdatesLoaded.bind( null, mcKey ),
				suppressSiteNameLink: true,
				showPrimaryFollowButtonOnCards: false,
				showBack: false,
				className: 'is-discover-stream is-site-stream',
			} ),
			document.getElementById( 'primary' ),
			context.store
		);
	}
};
