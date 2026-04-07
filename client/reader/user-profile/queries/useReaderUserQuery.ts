import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { addQueryArgs } from '@wordpress/url';
import wpcom from 'calypso/lib/wp';

export interface UserProfileResponse {
	user: {
		ID: number;
		user_login: string;
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
	recommended_blogs_count?: number;
}

interface ReaderUserQueryParams {
	find_by_id?: boolean;
	minimal?: boolean; // If true, the API will return only the most basic user information.
}

export const useReaderUserQuery = (
	userIdOrLogin?: string | number,
	params: ReaderUserQueryParams = {}
): UseQueryResult< UserProfileResponse, Error > => {
	const paramsKey = Object.entries( params )
		.sort()
		.map( ( [ key, value ] ) => `${ key }=${ value }` )
		.join( '&' );

	return useQuery( {
		queryKey: [ 'rest/v1.1', 'reader-users', userIdOrLogin, paramsKey ], // eslint-disable-line @tanstack/query/exhaustive-deps
		queryFn: () =>
			wpcom.req.get( {
				path: addQueryArgs( `/users/${ userIdOrLogin }`, params ),
				apiNamespace: 'rest/v1.1',
			} ),
		enabled: !! userIdOrLogin,
		staleTime: 30 * 60000, // 30 minutes
		retry: false,
		retryOnMount: false,
		refetchOnMount: false,
		refetchOnWindowFocus: false,
	} );
};
