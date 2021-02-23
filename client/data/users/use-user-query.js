/**
 * External dependencies
 */
import { useQuery } from 'react-query';

/**
 * Internal dependencies
 */
import wpcom from 'calypso/lib/wp';

const useUserQuery = ( siteId, login, queryOptions = {} ) => {
	return useQuery(
		[ 'user', siteId, login ],
		() => wpcom.req.get( `/sites/${ siteId }/users/login:${ login }` ),
		queryOptions
	);
};

export default useUserQuery;
