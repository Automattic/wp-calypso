/**
 * External dependencies
 */
import React from 'react';
import ReactDom from 'react-dom';
import moment from 'moment';
import { Provider as ReduxProvider } from 'react-redux';
import debugFactory from 'debug';

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
	listListing( context ) {
		var ListStream = require( 'reader/list-stream' ),
			basePath = '/read/list/:owner/:slug',
			fullAnalyticsPageTitle = analyticsPageTitle + ' > List > ' + context.params.user + ' - ' + context.params.list,
			listStore = feedStreamFactory( 'list:' + context.params.user + '-' + context.params.list ),
			mcKey = 'list';

		ensureStoreLoading( listStore, context );

		trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );
		recordTrack( 'calypso_reader_list_loaded', {
			list_owner: context.params.user,
			list_slug: context.params.list
		} );

		ReactDom.render(
			React.createElement( ReduxProvider, { store: context.store },
				React.createElement( ListStream, {
					key: 'tag-' + context.params.user + '-' + context.params.list,
					postStore: listStore,
					owner: encodeURIComponent( context.params.user ),
					slug: encodeURIComponent( context.params.list ),
					setPageTitle: setPageTitle,
					trackScrollPage: trackScrollPage.bind(
						null,
						basePath,
						fullAnalyticsPageTitle,
						analyticsPageTitle,
						mcKey
					),
					onUpdatesShown: trackUpdatesLoaded.bind( null, mcKey )
				} )
			),
			document.getElementById( 'primary' )
		);
	},

	listManagementSites( context ) {
		const listManagement = require( 'reader/list-management' ),
			basePath = '/read/list/:owner/:slug/sites',
			fullAnalyticsPageTitle = analyticsPageTitle + ' > Manage List > Sites',
			mcKey = 'list_sites';

		setPageTitle( i18n.translate( 'Manage List' ) );

		trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );

		ReactDom.render(
			React.createElement( ReduxProvider, { store: context.store },
				React.createElement( listManagement, {
					key: 'list-management-sites',
					owner: encodeURIComponent( context.params.user ),
					slug: encodeURIComponent( context.params.list ),
					tab: 'sites',
					trackScrollPage: trackScrollPage.bind(
						null,
						basePath,
						fullAnalyticsPageTitle,
						analyticsPageTitle,
						mcKey
					)
				} )
			),
			document.getElementById( 'primary' )
		);
	},

	listManagementTags( context ) {
		const listManagement = require( 'reader/list-management' ),
			basePath = '/read/list/:owner/:slug/tags',
			fullAnalyticsPageTitle = analyticsPageTitle + ' > Manage List > Tags',
			mcKey = 'list_tags';

		setPageTitle( i18n.translate( 'Manage List' ) );

		trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );

		ReactDom.render(
			React.createElement( ReduxProvider, { store: context.store },
				React.createElement( listManagement, {
					key: 'list-management-tags',
					owner: encodeURIComponent( context.params.user ),
					slug: encodeURIComponent( context.params.list ),
					tab: 'tags',
					trackScrollPage: trackScrollPage.bind(
						null,
						basePath,
						fullAnalyticsPageTitle,
						analyticsPageTitle,
						mcKey
					)
				} )
			),
			document.getElementById( 'primary' )
		);
	},

	listManagementDescriptionEdit( context ) {
		const listManagement = require( 'reader/list-management' ),
			basePath = '/read/list/:owner/:slug/edit',
			fullAnalyticsPageTitle = analyticsPageTitle + ' > Manage List > Description',
			mcKey = 'list_edit';

		setPageTitle( i18n.translate( 'Manage List Description' ) );

		trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );

		ReactDom.render(
			React.createElement( ReduxProvider, { store: context.store },
				React.createElement( listManagement, {
					key: 'list-management-description-edit',
					owner: encodeURIComponent( context.params.user ),
					slug: encodeURIComponent( context.params.list ),
					tab: 'description-edit'
				} )
			),
			document.getElementById( 'primary' )
		);
	}
};
