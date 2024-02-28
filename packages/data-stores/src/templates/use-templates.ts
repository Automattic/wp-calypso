import { useQuery, UseQueryResult, QueryOptions } from '@tanstack/react-query';
import wpcomRequest from 'wpcom-proxy-request';
import type { Template } from './types';

interface Options extends QueryOptions< Template[] > {
	enabled?: boolean;
}

const useTemplates = (
	siteId: string | number,
	queryOptions: Omit< Options, 'queryKey' > = {}
): UseQueryResult< Template[] > => {
	return useQuery< Template[] >( {
		queryKey: [ siteId, 'templates' ],
		queryFn: () =>
			wpcomRequest( {
				path: `/sites/${ siteId }/templates`,
				apiNamespace: 'wp/v2',
			} ),
		refetchOnMount: 'always',
		staleTime: Infinity,
		...queryOptions,
	} );
};

export default useTemplates;
