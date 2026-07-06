import { fetchAgencySitesWithPlugins } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const agencySitesWithPluginsQuery = ( agencyId: number, plugins: string[] ) =>
	queryOptions( {
		queryKey: [ 'agency', agencyId, 'sites-with-plugins', plugins ],
		queryFn: () => fetchAgencySitesWithPlugins( agencyId, plugins ),
	} );
