/**
 * External dependencies
 */
import React from 'react';
import ReactDom from 'react-dom';
import moment from 'moment';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import config from 'config';
import route from 'lib/route';
import trackScrollPage from 'lib/track-scroll-page';
import titleActions from 'lib/screen-title/actions';
import feedStreamFactory from 'lib/feed-stream-store';
import FeedStreamStoreActions from 'lib/feed-stream-store/actions';
import { recordTrack } from 'reader/stats';

const ANALYTICS_PAGE_TITLE = 'Reader';

function trackPageLoad( path, title, readerView ) {
	analytics.pageView.record( path, title );
	analytics.mc.bumpStat( 'reader_views', readerView === 'full_post' ? readerView : readerView + '_load' );
}

function ensureStoreLoading( store, context ) {
	if ( store.getPage() === 1 ) {
		if ( context && context.query && context.query.at ) {
			const startDate = moment( context.query.at );
			if ( startDate.isValid() ) {
				store.startDate = startDate.format();
			}
		}
		FeedStreamStoreActions.fetchNextPage( store.id );
	}
	return store;
}

function trackUpdatesLoaded( key ) {
	analytics.mc.bumpStat( 'reader_views', key + '_load_new' );
	analytics.ga.recordEvent( 'Reader', 'Clicked Load New Posts', key );
	recordTrack( 'calypso_reader_load_new_posts', {
		section: key
	} );
}

export default {
	discover( context ) {
		var blogId = config( 'discover_blog_id' ),
			SiteStream = require( 'reader/site-stream' ),
			basePath = route.sectionify( context.path ),
			fullAnalyticsPageTitle = ANALYTICS_PAGE_TITLE + ' > Site > ' + blogId,
			feedStore = feedStreamFactory( 'site:' + blogId ),
			mcKey = 'discover';

		titleActions.setTitle( 'Discover' );

		ensureStoreLoading( feedStore, context );

		trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );
		recordTrack( 'calypso_reader_discover_viewed' );

		ReactDom.render(
			React.createElement( SiteStream, {
				key: 'site-' + blogId,
				store: feedStore,
				siteId: blogId,
				trackScrollPage: trackScrollPage.bind(
					null,
					basePath,
					fullAnalyticsPageTitle,
					ANALYTICS_PAGE_TITLE,
					mcKey
				),
				onUpdatesShown: trackUpdatesLoaded.bind( null, mcKey ),
				suppressSiteNameLink: true,
				showBack: false
			} ),
			document.getElementById( 'primary' )
		);
	}
};
