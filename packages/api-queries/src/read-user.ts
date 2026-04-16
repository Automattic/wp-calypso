import { fetchReaderUser } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const getReaderUserQuery = ( userLogin?: string, userId?: string | number ) => {
	const userIdOrLogin = userLogin || userId;
	const params = {
		find_by_id: ! userLogin && userId ? true : undefined, // If userLogin is not provided, we will try to find the user by ID.
	};

	return queryOptions( {
		queryKey: [ 'v1.1', 'get-reader-user', userIdOrLogin, params ],
		queryFn: () => fetchReaderUser( userIdOrLogin!, params ),
		enabled: !! userIdOrLogin,
		staleTime: 30 * 60000, // 30 minutes
	} );
};
