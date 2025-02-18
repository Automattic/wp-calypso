import config from '@automattic/calypso-config';
import {
	InfiniteQueryObserverResult,
	keepPreviousData,
	useInfiniteQuery,
	useQuery,
} from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { SearchOptions } from 'calypso/my-sites/promote-post-i2/components/search-bar';
import { PostQueryResult } from './types';

type BlazablePostsQueryOptions = {
	page?: number;
};

interface PostQueryResultError {
	code?: string;
}

export const getSearchOptionsQueryParams = ( searchOptions: SearchOptions ) => {
	let searchQueryParams = '';

	if ( searchOptions.search ) {
		searchQueryParams += `&title=${ searchOptions.search }`;
	}
	if ( searchOptions.filter ) {
		if ( searchOptions.filter.status && searchOptions.filter.status !== 'all' ) {
			searchQueryParams += `&status=${ searchOptions.filter.status }`;
		}
		if ( searchOptions.filter.postType && searchOptions.filter.postType !== 'all' ) {
			searchQueryParams += `&filter_post_type=${ searchOptions.filter.postType }`;
		}
	}
	if ( searchOptions.order ) {
		searchQueryParams += `&order_by=${ searchOptions.order.orderBy }`;
		searchQueryParams += `&order=${ searchOptions.order.order }`;
	}

	return searchQueryParams;
};

async function queryPosts( siteId: number, queryparams: string ) {
	return await wpcom.req.get( {
		path: `/sites/${ siteId }/blaze/posts?${ queryparams }`,
		apiNamespace: config.isEnabled( 'is_running_in_jetpack_site' )
			? 'jetpack/v4/blaze-app'
			: 'wpcom/v2',
	} );
}

export const usePostsQueryStats = ( siteId: number, queryOptions = {} ) => {
	return useQuery( {
		queryKey: [ 'promote-post-posts-stats', siteId ],
		queryFn: async () => {
			const postsResponse = await queryPosts( siteId, `page=1&posts_per_page=1` );
			return {
				total_items: postsResponse?.total_items,
			};
		},
		...queryOptions,
		enabled: !! siteId,
		retryDelay: 3000,
		refetchOnWindowFocus: false,
		meta: {
			persist: false,
		},
	} );
};

const usePostsQueryPaged = (
	siteId: number,
	searchOptions: SearchOptions,
	queryOptions: BlazablePostsQueryOptions = {}
): InfiniteQueryObserverResult< PostQueryResult, PostQueryResultError > => {
	const searchQueryParams = getSearchOptionsQueryParams( searchOptions );
	return useInfiniteQuery( {
		queryKey: [ 'promote-post-posts', siteId, searchQueryParams ],
		queryFn: async ( { pageParam } ) => {
			// Fetch blazable posts
			const postsResponse = await queryPosts( siteId, `page=${ pageParam }${ searchQueryParams }` );

			const {
				posts,
				page,
				total_items,
				total_pages,
				warnings,
				tsp_eligible = false,
			} = postsResponse;
			const has_more_pages = page < total_pages;

			return {
				posts,
				has_more_pages,
				total_items,
				total_pages,
				page,
				warnings,
				tsp_eligible,
			};
		},
		...queryOptions,
		enabled: !! siteId,
		retryDelay: 3000,
		placeholderData: keepPreviousData,
		refetchOnWindowFocus: false,
		meta: {
			persist: false,
		},
		initialPageParam: 1,
		getNextPageParam: ( lastPage ) => {
			if ( lastPage.has_more_pages ) {
				return lastPage.page + 1;
			}
			return undefined;
		},
		retry: ( failureCount, error ) => {
			// The posts_not_ready happens when the posts are not sync yet
			// We want to show the error ASAP not waiting the retries in this case.
			if ( error.hasOwnProperty( 'code' ) && 'posts_not_ready' === error.code ) {
				return false;
			}

			// We have to define a fallback amount of failures because we
			// override the retry option with a function.
			// We use 3 as the failureCount since its the default value for
			// react-query that we used before.
			// @link https://react-query.tanstack.com/guides/query-retries
			return 3 > failureCount;
		},
	} );
};

export default usePostsQueryPaged;
