import { callApi } from '@automattic/data-stores/src/reader';
import { UseQueryResult, useQuery } from '@tanstack/react-query';
import { addQueryArgs } from '@wordpress/url';

export interface UserSitesResponse {
	total: number;
	primary_site_id: number;
	sites: UserSiteResponse[];
}

interface UserSiteResponse {
	ID: number;
	name: string;
	description: string;
	feed_ID: number;
	URL: string;
	icon: {
		img?: string;
		ico?: string;
	};
	is_following: boolean;
	last_published: string;
	posts_count: number;
	subscribers_count: number;
}

export default function useUserSitesQuery(
	userId: number
): UseQueryResult< UserSitesResponse, Error > {
	return useQuery( {
		queryKey: [ 'reader', 'user', userId, 'sites' ],
		queryFn: () =>
			callApi< UserSitesResponse >( {
				apiNamespace: 'wpcom/v2',
				path: addQueryArgs( `/users/${ userId }/sites`, {
					caller: 'reader', // To identify the caller of the API which filter the sites accordingly.
				} ),
				method: 'GET',
				isLoggedIn: true,
				apiVersion: '2',
			} ),
		staleTime: 5 * 60 * 1000, // 5 minutes
	} );
}
