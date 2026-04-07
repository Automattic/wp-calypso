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

export type GetReaderUser = Pick<
	GetReaderUserResponse,
	| 'ID'
	| 'user_login'
	| 'first_name'
	| 'last_name'
	| 'nice_name'
	| 'display_name'
	| 'description'
	| 'avatar_URL'
	| 'profile_URL'
>;

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
		find_by_id: ! userLogin && userId ? true : undefined, // If userLogin is not provided, we will try to find the user by ID.
	};
	const paramsKey = Object.entries( params )
		.sort()
		.map( ( [ key, value ] ) => `${ key }=${ value }` )
		.join( '&' );

	return useQuery( {
		queryKey: [ 'v1.1', 'get-reader-user', userIdOrLogin, paramsKey ], // eslint-disable-line @tanstack/query/exhaustive-deps
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

export function mapGetReaderUserResponseToUser(
	response?: GetReaderUserResponse
): GetReaderUser | null {
	return response
		? {
				ID: response.ID,
				user_login: response.user_login,
				first_name: response.first_name,
				last_name: response.last_name,
				nice_name: response.nice_name,
				display_name: response.display_name,
				description: response.description,
				avatar_URL: response.avatar_URL,
				profile_URL: response.profile_URL,
		  }
		: null;
}
