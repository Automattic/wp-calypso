import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';

export default function useQueryUsersMeBySiteId( siteId: number ) {
	return useQuery( {
		queryKey: [ 'core-users-me', siteId ],
		queryFn: () =>
			wpcom.req.get( {
				apiNamespace: 'wp/v2',
				path: `/sites/${ siteId }/users/me`,
			} ),
		refetchOnWindowFocus: false,
	} );
}
