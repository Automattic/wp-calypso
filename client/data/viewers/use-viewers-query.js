import { uniqueBy } from '@automattic/js-utils';
import { useInfiniteQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';

const extractPages = ( pages = [] ) => pages.flatMap( ( page ) => page.viewers );
const compareUnique = ( a, b ) => a.ID === b.ID;

const DEFAULT_PER_PAGE = 100;

const useViewersQuery = ( siteId, { number = DEFAULT_PER_PAGE } = {}, queryOptions = {} ) => {
	return useInfiniteQuery( {
		queryKey: [ 'viewers', siteId ],
		queryFn: ( { pageParam } ) =>
			wpcom.req.get( `/sites/${ siteId }/viewers`, { number, page: pageParam } ),
		...queryOptions,
		initialPageParam: 1,
		getNextPageParam: ( lastPage, allPages ) => {
			if ( lastPage.found <= allPages.length * number ) {
				return;
			}
			return allPages.length + 1;
		},
		select: ( data ) => {
			return {
				/* @TODO: `uniqueBy` is necessary, because the API can return duplicates */
				viewers: uniqueBy( extractPages( data.pages ), compareUnique ),
				total: data.pages[ 0 ].found,
				...data,
			};
		},
	} );
};

export default useViewersQuery;
