import { useQuery } from 'react-query';
import wpcom from 'calypso/lib/wp';

export const getCacheKey = ( siteId, login ) => [ 'user', siteId, login ];

const useUserQuery = ( siteId, login, queryOptions = {} ) => {
	return useQuery(
		getCacheKey( siteId, login ),
		() => wpcom.req.get( `/sites/${ siteId }/users/login:${ login }` ),
		queryOptions
	);
};

export default useUserQuery;
