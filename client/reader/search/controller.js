/** @format */
/**
 * External dependencies
 */
import React from 'react';
import page from 'page';
import qs from 'qs';

/**
 * Internal dependencies
 */
import feedStreamFactory from 'lib/feed-stream-store';
import { recordTrack } from 'reader/stats';
import {
	ensureStoreLoading,
	trackPageLoad,
	trackUpdatesLoaded,
	trackScrollPage,
} from 'reader/controller-helper';
import AsyncLoad from 'components/async-load';
import { SEARCH_TYPES } from 'reader/search-stream/search-stream-header';

const analyticsPageTitle = 'Reader';

// TODO: delete this after launching sites in search
function replaceSearchUrl( newValue, sort ) {
	let searchUrl = '/read/search';
	if ( newValue ) {
		searchUrl += '?' + qs.stringify( { q: newValue, sort } );
	}
	page.replace( searchUrl );
}

const exported = {
	search: function( context, next ) {
		const basePath = '/read/search',
			fullAnalyticsPageTitle = analyticsPageTitle + ' > Search',
			mcKey = 'search';

		const { sort = 'relevance', q: searchSlug, show = SEARCH_TYPES.POSTS } = context.query;

		let store;
		if ( searchSlug ) {
			store = feedStreamFactory( `search:${ sort }:${ searchSlug }` );
			store.isQuerySuggestion = context.query.isSuggestion === '1';
			ensureStoreLoading( store, context );
		} else {
			store = feedStreamFactory( 'custom_recs_posts_with_images' );
			ensureStoreLoading( store, context );
		}

		trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );
		if ( searchSlug ) {
			recordTrack( 'calypso_reader_search_performed', {
				query: searchSlug,
				sort,
			} );
		} else {
			recordTrack( 'calypso_reader_search_loaded' );
		}

		const autoFocusInput = ! searchSlug || context.query.focus === '1';

		function reportQueryChange( query ) {
			replaceSearchUrl( query, sort !== 'relevance' ? sort : undefined );
		}

		function reportSortChange( newSort ) {
			replaceSearchUrl( searchSlug, newSort !== 'relevance' ? newSort : undefined );
		}

		context.primary = (
			<AsyncLoad
				require="reader/search-stream"
				key="search"
				postsStore={ store }
				query={ searchSlug }
				trackScrollPage={ trackScrollPage.bind(
					null,
					basePath,
					fullAnalyticsPageTitle,
					analyticsPageTitle,
					mcKey
				) }
				onUpdatesShown={ trackUpdatesLoaded.bind( null, mcKey ) }
				showBack={ false }
				showPrimaryFollowButtonOnCards={ true }
				autoFocusInput={ autoFocusInput }
				onQueryChange={ reportQueryChange }
				onSortChange={ reportSortChange }
				searchType={ show }
			/>
		);
		next();
	},
};

export default exported;

export const { search } = exported;
