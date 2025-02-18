import page from '@automattic/calypso-router';
import { stringify } from 'qs';
import AsyncLoad from 'calypso/components/async-load';
import {
	trackPageLoad,
	trackUpdatesLoaded,
	trackScrollPage,
	userHasHistory,
} from 'calypso/reader/controller-helper';
import { SEARCH_TYPES } from 'calypso/reader/search-stream/search-stream-header';
import { recordTrack } from 'calypso/reader/stats';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import renderHeaderSection from '../lib/header-section';

const analyticsPageTitle = 'Reader';

// TODO: delete this after launching sites in search
function replaceSearchUrl( newValue, sort ) {
	let searchUrl = '/reader/search';
	if ( newValue ) {
		searchUrl += '?' + stringify( { q: newValue, sort } );
	}
	page.replace( searchUrl );
}

const exported = {
	search: function ( context, next ) {
		const basePath = '/reader/search';
		const fullAnalyticsPageTitle = analyticsPageTitle + ' > Search';
		const mcKey = 'search';
		const state = context.store.getState();

		const { sort = 'relevance', q, show = SEARCH_TYPES.POSTS } = context.query;
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
			replaceSearchUrl( query, sort !== 'relevance' ? sort : undefined );
		}

		function reportSortChange( newSort ) {
			replaceSearchUrl( searchSlug, newSort !== 'relevance' ? newSort : undefined );
		}
		context.renderHeaderSection = renderHeaderSection;

		context.primary = (
			<>
				<div>
					<div>
						<AsyncLoad
							require="calypso/reader/search-stream"
							key="search"
							streamKey={ streamKey }
							isSuggestion={ isQuerySuggestion }
							query={ searchSlug }
							sort={ sort }
							trackScrollPage={ trackScrollPage.bind(
								null,
								basePath,
								fullAnalyticsPageTitle,
								analyticsPageTitle,
								mcKey
							) }
							onUpdatesShown={ trackUpdatesLoaded.bind( null, mcKey ) }
							showBack={ userHasHistory( context ) }
							autoFocusInput={ autoFocusInput }
							onQueryChange={ reportQueryChange }
							onSortChange={ reportSortChange }
							searchType={ show }
							trendingTags={ context.params.trendingTags }
						/>
					</div>
				</div>
			</>
		);
		next();
	},
};

export default exported;

export const { search } = exported;
