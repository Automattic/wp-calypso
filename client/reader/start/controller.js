/**
 * External dependencies
 */
import React from 'react';
import ReactDom from 'react-dom';
import { Provider as ReduxProvider } from 'react-redux';
import i18n from 'i18n-calypso';
import page from 'page';
import qs from 'qs';

/**
 * Internal dependencies
 */
import feedStreamFactory from 'lib/feed-stream-store';
import { ensureStoreLoading, trackPageLoad, trackUpdatesLoaded, trackScrollPage, setPageTitle } from 'reader/controller-helper';
import { recordTrack } from 'reader/stats';

const analyticsPageTitle = 'Reader';

export function start( context ) {
	const startComponent = require( 'reader/start/main' ),
		basePath = '/recommendations/start',
		fullAnalyticsPageTitle = analyticsPageTitle + ' > Start',
		searchSlug = context.query.q,
		mcKey = 'start';

	let feedStore;
	if ( searchSlug ) {
		feedStore = feedStreamFactory( 'search:' + searchSlug ),
		ensureStoreLoading( feedStore, context );
	}

	setPageTitle( i18n.translate( 'Start' ) );

	trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );

	if ( searchSlug ) {
		recordTrack( 'calypso_reader_recommendations_start_search_performed', {
			query: searchSlug
		} );
	} else {
		recordTrack( 'calypso_reader_recommendations_start_loaded' );
	}

	ReactDom.render(
		React.createElement( ReduxProvider, { store: context.store },
			React.createElement( startComponent, {
				key: 'start',
				feedStore: feedStore,
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
					let searchUrl = '/recommendations/start';
					if ( newValue ) {
						searchUrl += '?' + qs.stringify( { q: newValue } );
					}
					page.replace( searchUrl );
				}
			} )
		),
		document.getElementById( 'primary' )
	);
}
