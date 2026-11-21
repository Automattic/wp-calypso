import { DEFAULT_PAGE_SIZE } from 'calypso/data/marketplace/constants';
import { ES_MAX_RESULT_OFFSET } from 'calypso/data/marketplace/use-es-query';

export const CATEGORY_PAGE_QUERY_ARG = 'page';

export const MAX_CATEGORY_PAGE = Math.floor( ES_MAX_RESULT_OFFSET / DEFAULT_PAGE_SIZE ) + 1;

/** The page number in a `page` query arg, or null unless it's a positive integer. */
export function parseCategoryPage( value ) {
	if ( typeof value !== 'string' || ! /^[1-9]\d*$/.test( value ) ) {
		return null;
	}

	return Number( value );
}

/** The page to show, falling back to the first page when the query arg is invalid or out of range. */
export function getCategoryPage( value ) {
	const page = parseCategoryPage( value );
	return page && page <= MAX_CATEGORY_PAGE ? page : 1;
}

/** Page 1 has no query arg, and the trailing slash is dropped since Calypso serves both paths as one page. */
export function getCategoryPageUrl( pathname, page ) {
	const path = pathname.replace( /\/+$/, '' );
	return page > 1 ? `${ path }?${ CATEGORY_PAGE_QUERY_ARG }=${ page }` : path;
}

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

/** Capped at the last page the search API can return. */
export function getCategoryPageCount( total ) {
	return Math.min( Math.ceil( ( total || 0 ) / DEFAULT_PAGE_SIZE ), MAX_CATEGORY_PAGE );
}

/** The first, last, current and adjacent pages, with null for each gap. */
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
