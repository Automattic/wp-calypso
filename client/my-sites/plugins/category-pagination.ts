import { DEFAULT_PAGE_SIZE } from 'calypso/data/marketplace/constants';
import { ES_MAX_RESULT_OFFSET } from 'calypso/data/marketplace/use-es-query';
import { ALLOWED_CATEGORIES } from './categories/use-categories';
import type { Category } from './categories';
import type { useTranslate } from 'i18n-calypso';

export const CATEGORY_PAGE_QUERY_ARG = 'page';

export const MAX_CATEGORY_PAGE = Math.floor( ES_MAX_RESULT_OFFSET / DEFAULT_PAGE_SIZE ) + 1;

// Premium and featured plugins come from unpaginated WordPress.com lists, not the search API.
const UNPAGINATED_CATEGORIES = [ 'paid', 'featured' ];

/** Exact slug only, since each casing would add its own SSR cache entries; English only for now. */
export function isPaginatedCategory( category?: string, lang?: string ): boolean {
	if ( ! category || lang ) {
		return false;
	}

	return ! UNPAGINATED_CATEGORIES.includes( category ) && ALLOWED_CATEGORIES.includes( category );
}

export function parseCategoryPage( value: unknown ): number | null {
	if ( typeof value !== 'string' || ! /^[1-9]\d*$/.test( value ) ) {
		return null;
	}

	return Number( value );
}

export function getCategoryPage( value: unknown ): number {
	const page = parseCategoryPage( value );
	return page && page <= MAX_CATEGORY_PAGE ? page : 1;
}

/** Drops the trailing slash, since Calypso serves both paths as one page. */
export function getCategoryPageUrl( pathname: string, page: number ): string {
	const path = pathname.replace( /\/+$/, '' );
	return page > 1 ? `${ path }?${ CATEGORY_PAGE_QUERY_ARG }=${ page }` : path;
}

export function getCategoryPaginationUrls( {
	pathname,
	page,
	hasNextPage,
}: {
	pathname: string;
	page: number;
	hasNextPage: boolean;
} ): { prev: string | null; next: string | null } {
	const nextPage = page + 1;

	return {
		prev: page > 1 ? getCategoryPageUrl( pathname, page - 1 ) : null,
		next:
			hasNextPage && nextPage <= MAX_CATEGORY_PAGE
				? getCategoryPageUrl( pathname, nextPage )
				: null,
	};
}

export function getCategoryPageCount( total: number | undefined ): number {
	return Math.min( Math.ceil( ( total || 0 ) / DEFAULT_PAGE_SIZE ), MAX_CATEGORY_PAGE );
}

/** The first, last, current and adjacent pages, with null for each gap. */
export function getCategoryPageNumbers( page: number, pageCount: number ): Array< number | null > {
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

export function getCategoryName(
	categories: Record< string, Category >,
	category: string
): string {
	return categories[ category ]?.menu || category.charAt( 0 ).toUpperCase() + category.slice( 1 );
}

export function getCategoryTitle(
	translate: ReturnType< typeof useTranslate >,
	categoryName: string,
	page: number
) {
	return page > 1
		? translate( 'Page %(page)d – %(categoryName)s Plugins', {
				args: { categoryName, page },
				comment: 'Title of a page of a plugins category listing, e.g. "Page 2 – SEO Plugins".',
			} )
		: translate( '%(categoryName)s Plugins', { args: { categoryName } } );
}
