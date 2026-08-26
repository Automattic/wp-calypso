import page from '@automattic/calypso-router';
import { stringify } from 'qs';
import AsyncLoad from 'calypso/components/async-load';
import { sectionify } from 'calypso/lib/route';
import {
	trackPageLoad,
	trackUpdatesLoaded,
	trackScrollPage,
} from 'calypso/reader/controller-helper';
import { recordTrack } from 'calypso/reader/stats';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import renderHeaderSection from '../lib/header-section';
import { fetchTrendingTags } from '../tags/controller';

const loadSearchStream = () =>
	import(
		/* webpackChunkName: "async-load-calypso-reader-search-stream" */ 'calypso/reader/search-stream'
	);

const ANALYTICS_PAGE_TITLE = 'Reader';

function replaceSearchUrl( pathname, query, sort ) {
	let searchUrl = pathname;
	if ( query ) {
		searchUrl += '?' + stringify( { q: query, sort } );
	}
	page.replace( searchUrl );
}

// Suggestions for logged-out visitors are built from trending tags.
export const fetchTrendingTagsIfLoggedOut = ( context, next ) => {
	if ( ! isUserLoggedIn( context.store.getState() ) ) {
		return fetchTrendingTags( context, next );
	}
	next();
};

export const search = ( context, next ) => {
	const basePath = sectionify( context.path );
	const fullAnalyticsPageTitle = ANALYTICS_PAGE_TITLE + ' > Search';
	const mcKey = 'search';
	const state = context.store.getState();

	const { sort = 'relevance', q } = context.query;
	const searchSlug = q;

	let streamKey = 'custom_recs_sites_with_images';
	let isQuerySuggestion = false;
	if ( searchSlug ) {
		streamKey = 'search:' + JSON.stringify( { sort, q } );
		isQuerySuggestion = context.query.isSuggestion === '1';
	}

	trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );
	if ( searchSlug ) {
		recordTrack( 'calypso_reader_search_performed', {
			query: searchSlug,
			sort,
		} );
	} else {
		recordTrack(
			'calypso_reader_search_loaded',
			{},
			{ pathnameOverride: getCurrentRoute( state ) }
		);
	}

	const autoFocusInput = ! searchSlug || context.query.focus === '1';

	function reportQueryChange( query ) {
		replaceSearchUrl( context.pathname, query, sort !== 'relevance' ? sort : undefined );
	}

	function reportSortChange( newSort ) {
		replaceSearchUrl( context.pathname, searchSlug, newSort !== 'relevance' ? newSort : undefined );
	}

	if ( ! isUserLoggedIn( state ) ) {
		context.renderHeaderSection = renderHeaderSection;
	}

	context.primary = (
		<AsyncLoad
			require={ loadSearchStream }
			key="search"
			streamKey={ streamKey }
			isSuggestion={ isQuerySuggestion }
			query={ searchSlug }
			sort={ sort }
			trackScrollPage={ trackScrollPage.bind(
				null,
				basePath,
				fullAnalyticsPageTitle,
				ANALYTICS_PAGE_TITLE,
				mcKey
			) }
			onUpdatesShown={ trackUpdatesLoaded.bind( null, mcKey ) }
			autoFocusInput={ autoFocusInput }
			onQueryChange={ reportQueryChange }
			onSortChange={ reportSortChange }
			trendingTags={ context.params.trendingTags }
			placeholder={ null }
		/>
	);
	next();
};
