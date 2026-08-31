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
import { fetchTrendingTags } from '../tags/controller';

const loadSearchStream = () =>
	import(
		/* webpackChunkName: "async-load-calypso-reader-search-stream" */ 'calypso/reader/search-stream'
	);

const ANALYTICS_PAGE_TITLE = 'Reader';

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

	const { sort = 'relevance', q: searchSlug } = context.query;

	const streamKey = searchSlug
		? 'search:' + JSON.stringify( { sort, q: searchSlug } )
		: 'custom_recs_sites_with_images';

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

	context.primary = (
		<AsyncLoad
			require={ loadSearchStream }
			key="search"
			streamKey={ streamKey }
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
			trendingTags={ context.params.trendingTags }
			placeholder={ null }
		/>
	);
	next();
};
