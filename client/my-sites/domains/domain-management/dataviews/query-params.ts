import { Context } from '@automattic/calypso-router';

export const DEFAULT_PAGE = 1;
export const DEFAULT_PER_PAGE = 50;
export const DEFAULT_SORT_FIELD = 'domain_name';
export const DEFAULT_SORT_DIRECTION = 'asc';

export type QueryParams = {
	page?: number;
	perPage?: number;
	search?: string;
	sortField?: string;
	sortDirection?: 'asc' | 'desc';
};

const getDefaultParams = () => ( {
	page: DEFAULT_PAGE,
	perPage: DEFAULT_PER_PAGE,
	search: '',
	sortField: DEFAULT_SORT_FIELD,
	sortDirection: DEFAULT_SORT_DIRECTION,
} );

export function getQueryParams( context: Context ) {
	return {
		...getDefaultParams(),
		page: context.query.page ? parseInt( context.query.page, 10 ) : DEFAULT_PAGE,
		perPage: context.query.perPage ? parseInt( context.query.perPage, 10 ) : DEFAULT_PER_PAGE,
		search: context.query.search,
		sortField: context.query.sortField || DEFAULT_SORT_FIELD,
		sortDirection:
			context.query.sortDirection && [ 'asc', 'desc' ].includes( context.query.sortDirection )
				? context.query.sortDirection
				: DEFAULT_SORT_DIRECTION,
	} as QueryParams;
}

export function buildPathWithQueryParams( queryParams: QueryParams ) {
	const url = new URL( window.location.href );
	Object.keys( queryParams ).forEach( ( key ) => {
		const value = queryParams[ key as keyof QueryParams ];
		if ( value ) {
			url.searchParams.set( key, value.toString() );
		} else {
			url.searchParams.delete( key );
		}
	} );

	return url.pathname + url.search + url.hash;
}
