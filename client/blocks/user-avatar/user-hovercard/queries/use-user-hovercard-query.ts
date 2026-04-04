import { useQuery, UseQueryResult } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';

export interface UserHovercardResponse {
	user: {
		ID: number;
		login: string;
		first_name: string;
		last_name: string;
		nice_name: string;
		display_name: string;
		description: string;
		avatar_URL: string;
		profile_URL: string;
	};
	primary_blog: {
		ID: number;
		feed_ID: number;
		URL: string;
		title: string;
		description: string;
		avatar_URL: string | null;
	} | null;
	recommended_blogs_count: number;
}

export const useUserHovercardQuery = (
	userIdOrLogin?: string | number
): UseQueryResult< UserHovercardResponse, Error > => {
	return useQuery( {
		queryKey: [ `reader--user-${ userIdOrLogin }-hovercard` ],
		queryFn: () =>
			wpcom.req.get( {
				path: `/users/${ userIdOrLogin }/hovercard`,
				apiNamespace: 'wpcom/v2',
			} ),
		enabled: !! userIdOrLogin,
		staleTime: 30 * 60000, // 30 minutes
		refetchOnMount: false,
		refetchOnWindowFocus: false,
	} );
};
