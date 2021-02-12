/**
 * External dependencies
 */
import { useInfiniteQuery } from 'react-query';

/**
 * Internal dependencies
 */
import wpcom from 'calypso/lib/wp';

export const DEFAULT_NUMBER = 100;
export const defaults = {
	number: DEFAULT_NUMBER,
	offset: 0,
};

const useUsers = ( fetchOptions = {}, queryOptions = {} ) => {
	const { search, siteId } = fetchOptions;

	const { data, ...rest } = useInfiniteQuery(
		[ 'users', siteId, search ],
		async ( { pageParam = 0 } ) => {
			const res = await wpcom
				.site( siteId )
				.usersList( { ...defaults, ...fetchOptions, offset: pageParam } );
			return res;
		},
		{
			getNextPageParam: ( lastPage, allPages ) => {
				if ( lastPage.found <= allPages.length * DEFAULT_NUMBER ) {
					return;
				}
				return allPages.length * DEFAULT_NUMBER;
			},
			...queryOptions,
		}
	);

	return {
		users: data?.pages.flatMap( ( page ) => page.users ) ?? [],
		total: data?.pages[ 0 ]?.found,
		data,
		...rest,
	};
};

export default useUsers;
