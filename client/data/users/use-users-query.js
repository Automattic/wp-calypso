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
			 * such as Administrator and Editor, and has also been added as a "Viewer".
			 * This is arguably a bug in the API, and should be deduped.
			 */
			const users = uniqueBy( extractPages( data.pages ), compareUnique );
			return {
				users,
				/*
				 * @TODO: The property name `total` is misleading.
				 * The value `found` is the total number of users returned from the query,
				 * not the total number of users on the site. It should be renamed to `found`,
				 * and a `totalUsers` property should be added to the response.
				 * See: https://github.com/Automattic/jetpack/pull/42170
				 */
				total: users?.length ?? data.pages[ 0 ].found,
				...data,
			};
		},
		...queryOptions,
	} );
};

export default useUsersQuery;
