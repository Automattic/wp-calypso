import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';

export const getCacheKey = ( siteId, login ) => [ 'user', siteId, login ];

const useUserQuery = ( siteId, login, queryOptions = {} ) => {
	return useQuery( {
		queryKey: getCacheKey( siteId, login ),
		queryFn: () => wpcom.req.get( `/sites/${ siteId }/users/login:${ login }` ),
		...queryOptions,
	} );
};

export default useUserQuery;
