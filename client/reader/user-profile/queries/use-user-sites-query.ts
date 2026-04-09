import { callApi } from '@automattic/data-stores/src/reader';
import { UseQueryResult, useQuery } from '@tanstack/react-query';

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
				path: `/users/${ userId }/sites`,
				method: 'GET',
				isLoggedIn: true,
				apiVersion: '2',
			} ),
		staleTime: 5 * 60 * 1000, // 5 minutes
	} );
}
