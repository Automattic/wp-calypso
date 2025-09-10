import { fetchWpComPlugin } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const wpComPluginQuery = ( slug: string ) =>
	queryOptions( {
		queryKey: [ 'wp-com-plugin', slug ],
		queryFn: () => fetchWpComPlugin( slug ),
	} );
