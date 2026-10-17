import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';

const getUserPath = ( userIdentifier ) =>
	typeof userIdentifier === 'number' ? userIdentifier : `login:${ userIdentifier }`;

export const getCacheKey = ( siteId, userIdentifier ) => [
	'user',
	siteId,
	getUserPath( userIdentifier ),
];

const useUserQuery = ( siteId, userIdentifier, queryOptions = {} ) => {
	return useQuery( {
		queryKey: getCacheKey( siteId, userIdentifier ),
		queryFn: () => wpcom.req.get( `/sites/${ siteId }/users/${ getUserPath( userIdentifier ) }` ),
		...queryOptions,
	} );
};

export default useUserQuery;
