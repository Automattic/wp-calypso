import { fetchReaderUser } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const getReaderUserQuery = (
	userLogin?: string,
	userId?: string | number,
	enabled: boolean = true
) => {
	const userIdOrLogin = userLogin || userId;
	const params = ! userLogin && userId ? { find_by_id: true } : {}; // If userLogin is not provided, we will try to find the user by ID.

	return queryOptions( {
		queryKey: [ 'reader', 'get-user', userIdOrLogin, params ],
		queryFn: () => fetchReaderUser( userIdOrLogin!, params ),
		enabled: !! userIdOrLogin && enabled,
		staleTime: 30 * 60000, // 30 minutes
	} );
};
