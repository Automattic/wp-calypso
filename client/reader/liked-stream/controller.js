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
import i18n from 'lib/mixins/i18n';
import route from 'lib/route';
import trackScrollPage from 'lib/track-scroll-page';
import feedStreamFactory from 'lib/feed-stream-store';
import FeedStreamStoreActions from 'lib/feed-stream-store/actions';
import { recordTrack } from 'reader/stats';
import titleActions from 'lib/screen-title/actions';

const analyticsPageTitle = 'Reader';

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

function setPageTitle( title ) {
	titleActions.setTitle( i18n.translate( '%s ‹ Reader', { args: title } ) );
}

export default {
	likes( context ) {
		var LikedPostsStream = require( 'reader/liked-stream/main' ),
			basePath = route.sectionify( context.path ),
			fullAnalyticsPageTitle = analyticsPageTitle + ' > My Likes',
			likedPostsStore = feedStreamFactory( 'likes' ),
			mcKey = 'postlike';

		ensureStoreLoading( likedPostsStore, context );

		trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );

		ReactDom.render(
			React.createElement( LikedPostsStream, {
				key: 'liked',
				store: likedPostsStore,
				setPageTitle: setPageTitle,
				trackScrollPage: trackScrollPage.bind(
					null,
					basePath,
					fullAnalyticsPageTitle,
					analyticsPageTitle,
					mcKey
				),
				onUpdatesShown: trackUpdatesLoaded.bind( null, mcKey )
			} ),
			document.getElementById( 'primary' )
		);
	}
};
