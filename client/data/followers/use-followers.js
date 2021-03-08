/**
 * External dependencies
 */
import { useInfiniteQuery } from 'react-query';
import { uniqueBy } from '@automattic/js-utils';

/**
 * Internal dependencies
 */
import wpcom from 'calypso/lib/wp';

const MAX_FOLLOWERS = 10; // means pages (= 1000 followers);

/**
 * Normalizes a follower object. Changes 'avatar' to 'avatar_URL' allowing a follower
 * object to be used with the Gravatar component.
 *
 * @param  {object} follower A follower ojbect
 * @returns {object}          A normalized follower object
 */
export function normalizeFollower( follower ) {
	follower.avatar_URL = follower.avatar;
	return follower;
}

const extractPages = ( pages = [] ) =>
	pages.flatMap( ( page ) => page.subscribers ).map( normalizeFollower );
const compareUnique = ( a, b ) => a.ID === b.ID;

const useFollowers = ( siteId, fetchOptions = {}, queryOptions = {} ) => {
	const { search, type } = fetchOptions;

	return useInfiniteQuery(
		[ 'followers', siteId, type, search ],
		async ( { pageParam = 1 } ) => {
			const res = await wpcom.site( siteId ).statsFollowers( { ...fetchOptions, page: pageParam } );
			return res;
		},
		{
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
			...queryOptions,
		}
	);
};

export default useFollowers;
