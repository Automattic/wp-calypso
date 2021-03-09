/**
 * External dependencies
 */
import { useInfiniteQuery } from 'react-query';
import { uniqueBy } from '@automattic/js-utils';

/**
 * Internal dependencies
 */
import wpcom from 'calypso/lib/wp';

const extractPages = ( pages = [] ) => pages.flatMap( ( page ) => page.viewers );
const compareUnique = ( a, b ) => a.ID === b.ID;

const defaults = {
	number: 100,
};

const useViewersQuery = ( siteId, fetchOptions = {}, queryOptions = {} ) => {
	return useInfiniteQuery(
		[ 'viewers', siteId ],
		( { pageParam = 1 } ) =>
			wpcom.req.get( `/sites/${ siteId }/viewers`, {
				...defaults,
				...fetchOptions,
				page: pageParam,
			} ),
		{
			getNextPageParam: ( lastPage, allPages ) => {
				if ( lastPage.found <= allPages.length * defaults.number ) {
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

export default useViewersQuery;
