import currentPageSearchMapping from '../route-to-query-mapping.json';

export function useCurrentPageSearchMapping( currentRoute: string | undefined ) {
	let searchQuery = '';
	if ( currentRoute ) {
		for ( const key in currentPageSearchMapping ) {
			if ( currentRoute.startsWith( key ) ) {
				searchQuery = currentPageSearchMapping[ key as keyof typeof currentPageSearchMapping ];
				break;
			}
		}
	}
	return searchQuery;
}
