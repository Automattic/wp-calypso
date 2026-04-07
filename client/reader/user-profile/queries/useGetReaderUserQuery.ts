import { callApi } from '@automattic/data-stores/src/reader';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { addQueryArgs } from '@wordpress/url';

export interface GetReaderUserResponse {
	ID: number;
	user_login: string;
	first_name: string;
	last_name: string;
	nice_name: string;
	display_name: string;
	description: string;
	avatar_URL: string;
	profile_URL: string;
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

interface GetReaderUserQueryParams {
	find_by_id?: boolean;
	minimal?: boolean; // If true, the API will return only the most basic user information.
}

export const useGetReaderUserQuery = (
	userLogin?: string,
	userId?: string | number
): UseQueryResult< GetReaderUserResponse, Error > => {
	const userIdOrLogin = userLogin || userId;
	const params: GetReaderUserQueryParams = {
		find_by_id: ! userLogin && !! userId ? true : undefined, // If userLogin is not provided, we will try to find the user by ID. This is for backward compatibility with old URLs that use user ID.
	};
	const paramsKey = Object.entries( params )
		.sort()
		.map( ( [ key, value ] ) => `${ key }=${ value }` )
		.join( '&' );

	return useQuery( {
		queryKey: [ 'v1.1', 'get-reader-user', userIdOrLogin, `params:${ paramsKey }` ], // eslint-disable-line @tanstack/query/exhaustive-deps
		queryFn: () =>
			callApi< GetReaderUserResponse >( {
				path: addQueryArgs( `/users/${ userIdOrLogin }`, params ),
				method: 'GET',
				isLoggedIn: true,
			} ),
		enabled: !! userIdOrLogin,
		staleTime: 30 * 60000, // 30 minutes
		retry: false,
		retryOnMount: false,
		refetchOnMount: false,
		refetchOnWindowFocus: false,
	} );
};
