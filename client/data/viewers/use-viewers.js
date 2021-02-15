/**
 * External dependencies
 */
import { useInfiniteQuery } from 'react-query';

/**
 * Internal dependencies
 */
import wpcom from 'calypso/lib/wp';
import uniqueBy from 'calypso/lib/uniqueBy';

const extractPages = ( pages = [] ) => pages.flatMap( ( page ) => page.viewers );
const compareUnique = ( a, b ) => a.ID === b.ID;

const DEFAULT_NUMBER = 100;
const defaults = {
	page: 1,
	number: 100,
};

const useViewers = ( fetchOptions = {}, queryOptions = {} ) => {
	const { siteId } = fetchOptions;

	return useInfiniteQuery(
		[ 'viewers', siteId ],
		async ( { pageParam = 1 } ) => {
			const res = await wpcom
				.undocumented()
				.site( siteId )
				.getViewers( { ...defaults, ...fetchOptions, page: pageParam } );
			return res;
		},
		{
			getNextPageParam: ( lastPage, allPages ) => {
				if ( lastPage.found <= allPages.length * DEFAULT_NUMBER ) {
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
			...queryOptions,
		}
	);
};

export default useViewers;
