export const DEFAULT_PAGE = 1;
export const DEFAULT_PER_PAGE = 15;

export type QueryParams = {
	page?: number;
	perPage?: number;
	search?: string;
};

const getDefaultParams = () => ( {
	page: DEFAULT_PAGE,
	perPage: DEFAULT_PER_PAGE,
	search: '',
} );

export default function useQueryParams() {
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
