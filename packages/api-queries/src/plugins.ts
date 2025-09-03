import { fetchUserSitesPlugins } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const pluginsQuery = () =>
	queryOptions( {
		queryKey: [ 'me', 'sites-plugins' ],
		queryFn: () => fetchUserSitesPlugins(),
	} );
