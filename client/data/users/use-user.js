/**
 * External dependencies
 */
import { useQuery } from 'react-query';

/**
 * Internal dependencies
 */
import wpcom from 'calypso/lib/wp';

const useUser = ( siteId, login, queryOptions = {} ) => {
	return useQuery(
		[ 'user', siteId, login ],
		() => wpcom.undocumented().site( siteId ).getUser( login ),
		queryOptions
	);
};

export default useUser;
