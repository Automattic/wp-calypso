/**
 * Internal dependencies
 */
import { DEFAULT_THEME_QUERY } from 'calypso/state/themes/constants';
import { getThemesLastPageForQuery } from 'calypso/state/themes/selectors/get-themes-last-page-for-query';

import 'calypso/state/themes/init';

const emptyObject = {};

/**
 * Returns true if the query has reached the last page of queryable pages, or
 * null if the total number of queryable themes if unknown.
 *
 * @param  {object}   state  Global state tree
 * @param  {number}   siteId Site ID
 * @param  {object}   query  Theme query object
 * @returns {?boolean}        Whether last themes page has been reached
 */
export function isThemesLastPageForQuery( state, siteId, query = emptyObject ) {
	const lastPage = getThemesLastPageForQuery( state, siteId, query );
	if ( null === lastPage ) {
		return lastPage;
	}

	return lastPage === ( query.page || DEFAULT_THEME_QUERY.page );
}
