import { usePrevious } from '@wordpress/compose';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { isRequestingThemesForQuery, prependThemeFilterKeys } from 'calypso/state/themes/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

function useThemeSearchDetails( query ) {
	const search = query.search || '';
	const searchTaxonomies =
		useSelector( ( state ) => prependThemeFilterKeys( state, query.filter ) ) || '';
	const searchTerm = searchTaxonomies + search;
	const prevSearchTerm = usePrevious( searchTerm );
	const searchTermHasChanged = prevSearchTerm !== searchTerm && !! searchTerm && searchTerm !== '';

	return { search, searchTaxonomies, searchTerm, searchTermHasChanged };
}

function useIsRequestingThemes( query ) {
	const isRequesting = useSelector(
		( state ) =>
			isRequestingThemesForQuery( state, 'wpcom', query ) ||
			isRequestingThemesForQuery( state, 'wporg', query ) ||
			isRequestingThemesForQuery( state, getSelectedSiteId( state ), query )
	);
	const prevIsRequesting = usePrevious( isRequesting );

	return { isRequesting, prevIsRequesting };
}

export default function SearchThemesTracks( { query = {}, themes = [] } ) {
	const { search, searchTaxonomies, searchTerm, searchTermHasChanged } =
		useThemeSearchDetails( query );
	const themesCount = themes.length;

	const { isRequesting, prevIsRequesting } = useIsRequestingThemes( query );

	const dispatch = useDispatch();

	const recordSearchEvent = recordTracksEvent( 'calypso_themes_search_results', {
		search,
		search_term: searchTerm.trim(),
		search_taxonomies: searchTaxonomies.trim(),
		tier: query.tier,
		result_count: themesCount,
	} );

	useEffect( () => {
		// We don't need to record an event if the search term is empty.
		if ( ! searchTerm ) {
			return;
		}

		// If the count is immediately valued after a search, the query is retrieving
		// results already available in the Redux store, skipping the remote fetches.
		// We can just record the event straight away.
		if ( searchTermHasChanged && ! isRequesting && themesCount > 0 ) {
			dispatch( recordSearchEvent );
			return;
		}

		// Otherwise, we wait until both WPCOM and WPORG requests are completed.
		if ( prevIsRequesting && ! isRequesting ) {
			dispatch( recordSearchEvent );
		}
	}, [
		themesCount,
		dispatch,
		isRequesting,
		prevIsRequesting,
		recordSearchEvent,
		searchTerm,
		searchTermHasChanged,
	] );

	return null;
}
