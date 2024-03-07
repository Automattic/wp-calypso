import { useQuery } from '@tanstack/react-query';
import wpcomRequest from 'wpcom-proxy-request';

export function useSiteMigrationKey( siteId: string | number | undefined ) {
	return useQuery< {
		migration_key: '';
	} >( {
		queryKey: [ 'site-migration', siteId ],
		queryFn: async () =>
			await wpcomRequest( {
				path: `/sites/${ siteId }/site-migration`,
				apiNamespace: 'wpcom/v2',
			} ),
		refetchOnWindowFocus: false,
		staleTime: Infinity,
		enabled: !! siteId,
	} );
}
