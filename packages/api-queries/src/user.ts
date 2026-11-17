import { fetchUserProfile } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const userQuery = ( userLogin?: string, userId?: string | number ) => {
	const userIdOrLogin = userLogin || userId;
	const params = ! userLogin && userId ? { find_by_id: true } : {}; // If userLogin is not provided, we will try to find the user by ID.

	return queryOptions( {
		queryKey: [ 'user', userIdOrLogin, params ],
		queryFn: () => fetchUserProfile( userIdOrLogin!, params ),
		enabled: !! userIdOrLogin,
		staleTime: 5 * 60000, // 5 minutes
	} );
};
