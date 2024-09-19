import config from '@automattic/calypso-config';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';

interface ApiResponse {
	migration_key: string;
}

const getMigrationKey = async ( siteId: number ): Promise< ApiResponse > => {
	const isWhiteLabeledPluginEnabled = config.isEnabled(
		'migration-flow/enable-white-labeled-plugin'
	);

	if ( isWhiteLabeledPluginEnabled ) {
		return wpcom.req.get(
			`/sites/${ siteId }/atomic-migration-status/wpcom-migration-key?http_envelope=1`,
			{
				apiNamespace: 'wpcom/v2',
			}
		);
	}

	return wpcom.req.get(
		`/sites/${ siteId }/atomic-migration-status/migrate-guru-key?http_envelope=1`,
		{
			apiNamespace: 'wpcom/v2',
		}
	);
};

type Options = Pick< UseQueryOptions, 'enabled' >;

export const useSiteMigrationKey = ( siteId?: number, options?: Options ) => {
	return useQuery( {
		queryKey: [ 'site-migration-key', siteId ],
		queryFn: () => getMigrationKey( siteId! ),
		retry: false,
		enabled: !! siteId && ( options?.enabled ?? true ),
		select: ( data ) => ( { migrationKey: data?.migration_key } ),
		refetchOnWindowFocus: false,
	} );
};
