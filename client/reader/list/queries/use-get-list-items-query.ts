import { callApi } from '@automattic/data-stores/src/reader';
import { UseQueryResult, useQuery } from '@tanstack/react-query';
import { addQueryArgs } from '@wordpress/url';

export interface GetListItemsResponse {
	ID: string;
	feed_ID: number;
	site_ID: number;
	tag_ID: number;
	meta: {
		links: {
			feed: string;
		};
		data: {
			feed: ListItemFeed;
		};
	};
}

interface ListItemFeed {
	blog_ID: string;
	feed_ID: string;
	blog_owner: {
		ID: number;
		name: string;
	};
	name: string;
	URL: string;
	feed_URL: string;
	subscribers_count: number;
	is_following: true;
	last_update: string;
	last_checked: string;
	marked_for_refresh: false;
	next_refresh_time: null;
	organization_id: number;
	subscription_id: string;
	unseen_count: number;
	meta: object;
	image: string;
	description: string;
}

interface GetListItemsQueryParams {
	meta?: string;
}

export default function useGetListItemsQuery(
	userLogin: string,
	listName: string
): UseQueryResult< GetListItemsResponse, Error > {
	const params: GetListItemsQueryParams = {
		meta: 'feed',
	};

	return useQuery( {
		queryKey: [ 'v1.2', 'GET', 'reader', userLogin, listName, params ],
		queryFn: () =>
			callApi< GetListItemsResponse >( {
				path: addQueryArgs( `/lists/${ userLogin }/${ listName }/items`, params ),
				method: 'GET',
				isLoggedIn: true,
				apiVersion: '1.2',
			} ),
		enabled: !! userLogin && !! listName,
		staleTime: 30 * 60000, // 30 minutes
	} );
}
