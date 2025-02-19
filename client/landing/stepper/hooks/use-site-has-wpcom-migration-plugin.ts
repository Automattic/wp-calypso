import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';

type Options = Pick< UseQueryOptions, 'retry' | 'enabled' >;

const getSiteHasWPCOMMigrationPlugin = ( siteId: number ) => {
	return wpcom.req.get( {
		path: `/sites/${ siteId }/plugins`,
		apiVersion: '1.1',
	} );
};

export const useSiteHasWPCOMMigrationPlugin = ( siteId: number, options: Options ) => {
	const { retry, enabled = false } = options;
	const { data, error, isLoading, isSuccess } = useQuery( {
		queryKey: [ 'site-has-wpcom-migration-plugin', siteId ],
		queryFn: () => getSiteHasWPCOMMigrationPlugin( siteId ),
		retry,
		enabled,
	} );

	const pluginRecord = data?.plugins.find( ( plugin: any ) => plugin.slug === 'wpcom-migration' );
	const hasWPCOMMigraitonPlugin = Boolean( pluginRecord );

	return { data, error, isLoading, isSuccess, pluginRecord, hasWPCOMMigraitonPlugin };
};
