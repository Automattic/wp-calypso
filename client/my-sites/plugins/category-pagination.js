import { DEFAULT_PAGE_SIZE } from 'calypso/data/marketplace/constants';
import { ES_MAX_RESULT_WINDOW } from 'calypso/data/marketplace/use-es-query';

export const CATEGORY_PAGE_QUERY_ARG = 'page';

export const MAX_CATEGORY_PAGE = Math.floor( ES_MAX_RESULT_WINDOW / DEFAULT_PAGE_SIZE );

/**
 * Parse the `page` query arg of a plugins category page.
 * @param {*} value The raw query arg value
 * @returns {number|null} The page number, or null when the value is not a positive integer
 */
export function parseCategoryPage( value ) {
	if ( typeof value !== 'string' || ! /^[1-9]\d*$/.test( value ) ) {
		return null;
	}

	return Number( value );
}

/**
 * The page a plugins category page shows, defaulting to the first page.
 * @param {*} value The raw query arg value
 * @returns {number} The page number
 */
export function getCategoryPage( value ) {
	const page = parseCategoryPage( value );
	return page && page <= MAX_CATEGORY_PAGE ? page : 1;
}

/**
 * Build the URL of a page of a plugins category. The first page has no query arg,
 * so it keeps a single URL.
 * @param {string} pathname The category page pathname
 * @param {number} page The page number
 * @returns {string} The page URL
 */
export function getCategoryPageUrl( pathname, page ) {
	return page > 1 ? `${ pathname }?${ CATEGORY_PAGE_QUERY_ARG }=${ page }` : pathname;
}

/**
 * Get the previous and next page URLs of a plugins category page.
 * @param {Object} options
 * @param {string} options.pathname The category page pathname
 * @param {number} options.page The page the list starts at
 * @param {number} options.loadedPages How many pages the list shows, as infinite scroll appends pages
 * @param {boolean} options.hasNextPage Whether the search has more results
 * @returns {{ prev: string|null, next: string|null }} The page URLs
 */
export function getCategoryPaginationUrls( { pathname, page, loadedPages = 1, hasNextPage } ) {
	const nextPage = page + Math.max( loadedPages, 1 );

	return {
		prev: page > 1 ? getCategoryPageUrl( pathname, page - 1 ) : null,
		next:
			hasNextPage && nextPage <= MAX_CATEGORY_PAGE
				? getCategoryPageUrl( pathname, nextPage )
				: null,
	};
}
