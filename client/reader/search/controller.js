/**
 * External dependencies
 */
import React from 'react';
import ReactDom from 'react-dom';
import page from 'page';
import qs from 'qs';

/**
 * Internal dependencies
 */
import feedStreamFactory from 'lib/feed-stream-store';
import { recordTrack } from 'reader/stats';
import { ensureStoreLoading, trackPageLoad, trackUpdatesLoaded, trackScrollPage, setPageTitle } from 'reader/controller-helper';

const analyticsPageTitle = 'Reader';

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
		if ( searchSlug ) {
			recordTrack( 'calypso_reader_search_performed', {
				query: searchSlug
			} );
		} else {
			recordTrack( 'calypso_reader_search_loaded' );
		}

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
