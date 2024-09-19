import { uniqueBy } from '@automattic/js-utils';
import { useInfiniteQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';

const MAX_FOLLOWERS = 100; // means pages (= 10000 followers);
const defaults = {
	max: 100,
};

/**
 * Normalizes a follower object. Changes 'avatar' to 'avatar_URL' allowing a follower
 * object to be used with the Gravatar component.
 * @param  {Object} follower A follower ojbect
 * @returns {Object}          A normalized follower object
 */
export function normalizeFollower( follower ) {
	return {
		avatar_URL: follower.avatar,
		...follower,
	};
}

const extractPages = ( pages = [] ) =>
	pages.flatMap( ( page ) => page.subscribers ).map( normalizeFollower );
const compareUnique = ( a, b ) => a.ID === b.ID;

const useFollowersQuery = ( siteId, type = 'wpcom', fetchOptions = {}, queryOptions = {} ) => {
	const { search } = fetchOptions;

	return useInfiniteQuery( {
		queryKey: [ 'followers', siteId, type, search ],
		queryFn: async ( { pageParam } ) =>
			wpcom.req.get( `/sites/${ siteId }/followers`, {
				...defaults,
				...fetchOptions,
				type,
				page: pageParam,
			} ),
		...queryOptions,
		initialPageParam: 1,
		getNextPageParam: ( lastPage, allPages ) => {
			if ( lastPage.pages <= allPages.length || allPages.length >= MAX_FOLLOWERS ) {
				return;
			}
			return allPages.length + 1;
		},
		select: ( data ) => {
			return {
				/* @TODO: `uniqueBy` is necessary, because the API can return duplicates */
				followers: uniqueBy( extractPages( data.pages ), compareUnique ),
				total: data.pages[ 0 ].total,
				...data,
			};
		},
	} );
};

export default useFollowersQuery;
