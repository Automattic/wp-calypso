import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';

interface ApiResponse {
	migration_key: string;
}

const getMigrationKey = async ( siteId: number ): Promise< ApiResponse > =>
	wpcom.req.get( `/sites/${ siteId }/atomic-migration-status/migrate-guru-key?http_envelope=1`, {
		apiNamespace: 'wpcom/v2',
	} );

export const useSiteMigrationKey = ( siteId?: number ) => {
	return useQuery( {
		queryKey: [ 'site-migration-key', siteId ],
		queryFn: () => getMigrationKey( siteId! ),
		retry: false,
		enabled: !! siteId,
		select: ( data ) => ( { migrationKey: data?.migration_key } ),
		refetchOnWindowFocus: false,
	} );
};
