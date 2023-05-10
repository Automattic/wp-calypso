import { useInfiniteQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { BlazablePost } from 'calypso/my-sites/promote-post-i2/components/post-item';
import { SearchOptions } from 'calypso/my-sites/promote-post-i2/components/search-bar';

type PostStats = {
	ID: number;
	views: number;
};

type BlazablePostsQueryOptions = {
	page?: number;
};

const getSearchOptionsQueryParams = ( searchOptions: SearchOptions ) => {
	let searchQueryParams = '';

	if ( searchOptions.search ) {
		searchQueryParams += `&title=${ searchOptions.search }`;
	}
	if ( searchOptions.filter ) {
		if ( searchOptions.filter.status && searchOptions.filter.status !== 'all' ) {
			searchQueryParams += `&status=${ searchOptions.filter.status }`;
		}
	}
	if ( searchOptions.order ) {
		searchQueryParams += `&order_by=${ searchOptions.order.orderBy }`;
		searchQueryParams += `&order=${ searchOptions.order.order }`;
	}

	return searchQueryParams;
};

type StatProps = {
	post_ids: string;
	num: number;
};

function queryStats( siteId: number, params: StatProps ) {
	return wpcom.req.get( `/sites/${ siteId }/stats/views/posts`, params );
}

async function queryPostAndStats( siteId: number, queryparams: string ) {
	const postsQuery = await wpcom.req.get( {
		path: `/sites/${ siteId }/blaze/posts?${ queryparams }`,
		apiNamespace: 'wpcom/v2',
	} );

	// Then, get stats in a separate call
	const postIds = postsQuery.posts.map( ( post: BlazablePost ) => post.ID ).join( ',' );
	const statsQuery = await queryStats( siteId, {
		post_ids: postIds,
		num: 30,
	} );

	// join stats to posts
	const posts = postsQuery.posts.map( ( post: BlazablePost ) => {
		const stats = statsQuery.posts.find( ( stat: PostStats ) => stat.ID === post.ID );
		return {
			...post,
			view_count: stats ? stats.views : 0,
		};
	} );

	const { page, total_items, total_pages } = postsQuery;

	return {
		posts,
		page,
		total_items,
		total_pages,
	};
}

const usePostsQueryPaged = (
	siteId: number,
	searchOptions: SearchOptions,
	queryOptions: BlazablePostsQueryOptions = {}
) => {
	const searchQueryParams = getSearchOptionsQueryParams( searchOptions );
	return useInfiniteQuery(
		[ 'promote-post-posts', siteId, searchQueryParams ],
		async ( { pageParam = 1 } ) => {
			// Fetch blazable posts
			const postsResponse = await queryPostAndStats(
				siteId,
				`page=${ pageParam }${ searchQueryParams }`
			);

			// if user selected "views" then do the sorting here
			if ( searchOptions.order && searchOptions.order.orderBy === 'view_count' ) {
				postsResponse.posts.sort( ( a: BlazablePost, b: BlazablePost ) => {
					if ( searchOptions?.order?.order === 'ASC' ) {
						return a.view_count - b.view_count;
					}
					return b.view_count - a.view_count;
				} );
			}

			const { posts, page, total_items, total_pages } = postsResponse;
			const has_more_pages = page < total_pages;

			return {
				posts,
				has_more_pages,
				total_items,
				total_pages,
				page,
			};
		},
		{
			...queryOptions,
			enabled: !! siteId,
			retryDelay: 3000,
			keepPreviousData: true,
			refetchOnWindowFocus: false,
			meta: {
				persist: false,
			},
			getNextPageParam: ( lastPage ) => {
				if ( lastPage.has_more_pages ) {
					return lastPage.page + 1;
				}
				return undefined;
			},
		}
	);
};

export default usePostsQueryPaged;
