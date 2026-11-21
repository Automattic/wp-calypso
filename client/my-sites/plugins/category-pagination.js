import { DEFAULT_PAGE_SIZE } from 'calypso/data/marketplace/constants';
import { ES_MAX_RESULT_OFFSET } from 'calypso/data/marketplace/use-es-query';

export const CATEGORY_PAGE_QUERY_ARG = 'page';

export const MAX_CATEGORY_PAGE = Math.floor( ES_MAX_RESULT_OFFSET / DEFAULT_PAGE_SIZE ) + 1;

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
 * so it keeps a single URL. Calypso serves `/plugins/browse/seo/` as the same page
 * as `/plugins/browse/seo`, so page URLs never keep a trailing slash.
 * @param {string} pathname The category page pathname
 * @param {number} page The page number
 * @returns {string} The page URL
 */
export function getCategoryPageUrl( pathname, page ) {
	const path = pathname.replace( /\/+$/, '' );
	return page > 1 ? `${ path }?${ CATEGORY_PAGE_QUERY_ARG }=${ page }` : path;
}

/**
 * Get the previous and next page URLs of a plugins category page.
 * @param {Object} options
 * @param {string} options.pathname The category page pathname
 * @param {number} options.page The page number
 * @param {boolean} options.hasNextPage Whether the search has more results
 * @returns {{ prev: string|null, next: string|null }} The page URLs
 */
export function getCategoryPaginationUrls( { pathname, page, hasNextPage } ) {
	const nextPage = page + 1;

	return {
		prev: page > 1 ? getCategoryPageUrl( pathname, page - 1 ) : null,
		next:
			hasNextPage && nextPage <= MAX_CATEGORY_PAGE
				? getCategoryPageUrl( pathname, nextPage )
				: null,
	};
}

/**
 * The number of pages a plugins category has, within the search result window.
 * @param {number} total The number of plugins in the category
 * @returns {number} The page count
 */
export function getCategoryPageCount( total ) {
	return Math.min( Math.ceil( ( total || 0 ) / DEFAULT_PAGE_SIZE ), MAX_CATEGORY_PAGE );
}

/**
 * The page numbers to link to from a plugins category page: the first and last pages
 * and the pages next to the current one.
 * @param {number} page The current page
 * @param {number} pageCount The number of pages
 * @returns {Array<number|null>} The page numbers, with null where pages are skipped
 */
export function getCategoryPageNumbers( page, pageCount ) {
	if ( pageCount < 2 ) {
		return [];
	}

	const pages = [ ...new Set( [ 1, page - 1, page, page + 1, pageCount ] ) ]
		.filter( ( n ) => n >= 1 && n <= pageCount )
		.sort( ( a, b ) => a - b );

	return pages.flatMap( ( n, i ) => {
		const previous = pages[ i - 1 ];
		if ( previous === undefined || n === previous + 1 ) {
			return [ n ];
		}
		return n === previous + 2 ? [ previous + 1, n ] : [ null, n ];
	} );
}
