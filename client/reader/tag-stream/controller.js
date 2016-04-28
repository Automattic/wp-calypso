/**
 * External dependencies
 */
import React from 'react';
import ReactDom from 'react-dom';
import moment from 'moment';
import trim from 'lodash/trim';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import i18n from 'lib/mixins/i18n';
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
	tagListing( context ) {
		var TagStream = require( 'reader/tag-stream' ),
			basePath = '/tag/:slug',
			fullAnalyticsPageTitle = analyticsPageTitle + ' > Tag > ' + context.params.tag,
			tagSlug = trim( context.params.tag )
				.toLowerCase()
				.replace( /\s+/g, '-' )
				.replace( /-{2,}/g, '-' ),
			encodedTag = encodeURIComponent( tagSlug ).toLowerCase(),
			tagStore = feedStreamFactory( 'tag:' + tagSlug ),
			mcKey = 'topic';

		ensureStoreLoading( tagStore, context );

		trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );
		recordTrack( 'calypso_reader_tag_loaded', {
			tag: tagSlug
		} );

		ReactDom.render(
			React.createElement( TagStream, {
				key: 'tag-' + encodedTag,
				store: tagStore,
				tag: encodedTag,
				setPageTitle: setPageTitle,
				trackScrollPage: trackScrollPage.bind(
					null,
					basePath,
					fullAnalyticsPageTitle,
					analyticsPageTitle,
					mcKey
				),
				onUpdatesShown: trackUpdatesLoaded.bind( null, mcKey ),
				showBack: !! context.lastRoute
			} ),
			document.getElementById( 'primary' )
		);
	}
};
