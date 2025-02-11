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

export function getQueryParams() {
	const queryParams = new URLSearchParams( window.location.search );
	return {
		...getDefaultParams(),
		page: queryParams.get( 'page' )?.length
			? parseInt( queryParams.get( 'page' ) as string, 10 )
			: DEFAULT_PAGE,
		perPage: queryParams.get( 'perPage' )?.length
			? parseInt( queryParams.get( 'perPage' ) as string, 10 )
			: DEFAULT_PER_PAGE,
		search: queryParams.get( 'search' ),
		sortField: queryParams.get( 'sortField' ) || DEFAULT_SORT_FIELD,
		sortDirection:
			queryParams.get( 'sortDirection' ) &&
			[ 'asc', 'desc' ].includes( queryParams.get( 'sortDirection' ) as string )
				? queryParams.get( 'sortDirection' )
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
