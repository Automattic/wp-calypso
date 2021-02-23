/**
 * External dependencies
 */
import { useInfiniteQuery } from 'react-query';
import { uniqueBy } from '@automattic/js-utils';

/**
 * Internal dependencies
 */
import wpcom from 'calypso/lib/wp';

export const DEFAULT_NUMBER = 100;
export const defaults = {
	number: DEFAULT_NUMBER,
	offset: 0,
};

const extractPages = ( pages = [] ) => pages.flatMap( ( page ) => page.users );
const compareUnique = ( a, b ) => a.ID === b.ID;

const useUsers = ( fetchOptions = {}, queryOptions = {} ) => {
	const { search, siteId } = fetchOptions;

	return useInfiniteQuery(
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
			select: ( data ) => {
				return {
					/* @TODO: `uniqueBy` is necessary, because the API can return duplicates */
					users: uniqueBy( extractPages( data.pages ), compareUnique ),
					total: data.pages[ 0 ].found,
					...data,
				};
			},
			...queryOptions,
		}
	);
};

export default useUsers;
