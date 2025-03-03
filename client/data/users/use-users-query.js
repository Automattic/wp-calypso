import { uniqueBy } from '@automattic/js-utils';
import { useInfiniteQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';

export const defaults = {
	number: 100,
	order: 'ASC',
	order_by: 'display_name',
};

const extractPages = ( pages = [] ) => pages.flatMap( ( page ) => page.users );
const compareUnique = ( a, b ) => a.ID === b.ID;

const useUsersQuery = ( siteId, fetchOptions = {}, queryOptions = {} ) => {
	const { search } = fetchOptions;

	return useInfiniteQuery( {
		queryKey: [ 'users', siteId, search ],
		queryFn: ( { pageParam } ) =>
			wpcom.req.get( `/sites/${ siteId }/users`, {
				...defaults,
				...fetchOptions,
				offset: pageParam,
			} ),
		enabled: !! siteId,
		initialPageParam: 0,
		getNextPageParam: ( lastPage, allPages ) => {
			const n = fetchOptions.number ?? defaults.number;
			if ( lastPage.found <= allPages.length * n ) {
				return;
			}
			return allPages.length * n;
		},
		select: ( data ) => {
			/* @TODO:
			 * `uniqueBy` is necessary, because the API can return duplicates.
			 * This is most commonly seen where a user has both a "regular" user role
			 * such as Administrator and Editor, and has also been added as a "Viewer" .
			 */
			const users = uniqueBy( extractPages( data.pages ), compareUnique );
			return {
				users: uniqueBy( extractPages( data.pages ), compareUnique ),
				total: users?.length ?? data.pages[ 0 ].found,
				...data,
			};
		},
		...queryOptions,
	} );
};

export default useUsersQuery;
