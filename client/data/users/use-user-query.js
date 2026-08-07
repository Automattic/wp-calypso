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
	const userPath = getUserPath( userIdentifier );

	return useQuery( {
		queryKey: [ 'user', siteId, userPath ],
		queryFn: () => wpcom.req.get( `/sites/${ siteId }/users/${ userPath }` ),
		...queryOptions,
	} );
};

export default useUserQuery;
