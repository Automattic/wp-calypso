/**
 * External dependencies
 */
import React from 'react';
import ReactDom from 'react-dom';
import moment from 'moment';
import debugFactory from 'debug';
import page from 'page';
import qs from 'qs';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import i18n from 'lib/mixins/i18n';
import feedStreamFactory from 'lib/feed-stream-store';
import FeedStreamStoreActions from 'lib/feed-stream-store/actions';
import titleActions from 'lib/screen-title/actions';
import { recordTrack } from 'reader/stats';

const analyticsPageTitle = 'Reader';
const debug = debugFactory( 'calypso:reader:controller' );

function trackPageLoad( path, title, readerView ) {
	analytics.pageView.record( path, title );
	analytics.mc.bumpStat( 'reader_views', readerView === 'full_post' ? readerView : readerView + '_load' );
}

function setPageTitle( title ) {
	titleActions.setTitle( i18n.translate( '%s ‹ Reader', { args: title } ) );
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

function trackScrollPage( path, title, category, readerView, pageNum ) {
	debug( 'scroll [%s], [%s], [%s], [%d]', path, title, category, pageNum );

	analytics.ga.recordEvent( category, 'Loaded Next Page', 'page', pageNum );
	recordTrack( 'calypso_reader_infinite_scroll_performed', {
		path: path,
		page: pageNum,
		section: readerView
	} );
	analytics.pageView.record( path, title );
	analytics.mc.bumpStat( {
		newdash_pageviews: 'scroll',
		reader_views: readerView + '_scroll'
	} );
}

function trackUpdatesLoaded( key ) {
	analytics.mc.bumpStat( 'reader_views', key + '_load_new' );
	analytics.ga.recordEvent( 'Reader', 'Clicked Load New Posts', key );
	recordTrack( 'calypso_reader_load_new_posts', {
		section: key
	} );
}

export default {
	search: function( context ) {
		var SearchStream = require( 'reader/search-stream' ),
			basePath = '/read/search',
			fullAnalyticsPageTitle = analyticsPageTitle + ' > Search',
			searchSlug = context.query.q,
			mcKey = 'search';

		let store;
		if ( searchSlug ) {
			store = feedStreamFactory( 'search:' + searchSlug ),
			ensureStoreLoading( store, context );
		}

		trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );
		recordTrack( 'calypso_reader_search_loaded', searchSlug && {
			query: searchSlug
		} );

		ReactDom.render(
			React.createElement( SearchStream, {
				key: 'search',
				store: store,
				query: searchSlug,
				setPageTitle: setPageTitle,
				trackScrollPage: trackScrollPage.bind(
					null,
					basePath,
					fullAnalyticsPageTitle,
					analyticsPageTitle,
					mcKey
				),
				onUpdatesShown: trackUpdatesLoaded.bind( null, mcKey ),
				showBack: false,
				onQueryChange: function( newValue ) {
					let searchUrl = '/read/search';
					if ( newValue ) {
						searchUrl += '?' + qs.stringify( { q: newValue } );
					}
					page.replace( searchUrl );
				}
			} ),
			document.getElementById( 'primary' )
		);
	}
};
