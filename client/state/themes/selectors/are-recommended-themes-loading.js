import 'calypso/state/themes/init';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { DEFAULT_THEME_QUERY } from 'calypso/state/themes/constants';
import { getSerializedThemesQuery } from '../utils';

/**
 * Returns whether the recommended themes list is loading.
 *
 * @param {object} state Global state tree
 * @param {string} filters A filter string for a theme query
 * @param {string} siteId A filter string for a theme query
 * @returns {boolean} whether the recommended themes list is loading
 */
export function areRecommendedThemesLoading( state, filters, siteId ) {
	const sourceSiteId = siteId && isJetpackSite( state, siteId ) ? siteId : 'wpcom';
	const queries = filters.map( ( filter ) => ( {
		...DEFAULT_THEME_QUERY,
		filter,
		// TODO: Remove hardcoded number
		number: 30,
	} ) );

	// Checks the loading state for each themes query made for recommended themes
	const isLoadingRecommendedThemes = queries.some( ( query ) => {
		const serializedQuery = getSerializedThemesQuery( query, sourceSiteId );
		return state?.themes?.queryRequests[ serializedQuery ];
	} );

	return isLoadingRecommendedThemes;
}
