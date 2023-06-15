import { usePrevious } from '@wordpress/compose';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { prependThemeFilterKeys } from 'calypso/state/themes/selectors';

function useThemeSearchDetails( query ) {
	const search = query.search || '';
	const searchTaxonomies =
		useSelector( ( state ) => prependThemeFilterKeys( state, query.filter ) ) || '';
	const searchTerm = searchTaxonomies + search;
	const prevSearchTerm = usePrevious( searchTerm );
	const searchTermHasChanged = prevSearchTerm !== searchTerm && !! searchTerm && searchTerm !== '';

	return { search, searchTaxonomies, searchTerm, searchTermHasChanged };
}

export default function SearchThemesTracks( {
	query = {},
	interlacedThemes = [],
	wpComThemes = [],
	wpOrgThemes = [],
	isRequesting = false,
} ) {
	const { search, searchTaxonomies, searchTerm, searchTermHasChanged } =
		useThemeSearchDetails( query );
	const prevIsRequesting = usePrevious( isRequesting );

	const dispatch = useDispatch();

	const recordSearchEvent = recordTracksEvent( 'calypso_themes_search_results', {
		search,
		search_term: searchTerm.trim(),
		search_taxonomies: searchTaxonomies.trim(),
		tier: query.tier,
		result_count: wpComThemes.length + wpOrgThemes.length,
		actual_count: interlacedThemes.length,
		wpcom_result_count: wpComThemes.length,
		wporg_result_count: wpOrgThemes.length,
	} );

	useEffect( () => {
		// We don't need to record an event if the search term is empty.
		if ( ! searchTerm ) {
			return;
		}

		// If the count is immediately valued after a search, the query is retrieving
		// results already available in the Redux store, skipping the remote fetches.
		// We can just record the event straight away.
		if ( searchTermHasChanged && ! isRequesting && interlacedThemes.length > 0 ) {
			dispatch( recordSearchEvent );
			return;
		}

		// Otherwise, we wait until both WPCOM and WPORG requests are completed.
		if ( prevIsRequesting && ! isRequesting ) {
			dispatch( recordSearchEvent );
		}
	}, [
		interlacedThemes.length,
		dispatch,
		isRequesting,
		prevIsRequesting,
		recordSearchEvent,
		searchTerm,
		searchTermHasChanged,
	] );

	return null;
}
