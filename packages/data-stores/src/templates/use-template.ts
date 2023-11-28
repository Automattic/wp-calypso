import { useQuery, UseQueryResult, QueryOptions } from '@tanstack/react-query';
import wpcomRequest from 'wpcom-proxy-request';
import type { Template } from './types';

interface Options extends QueryOptions< Template > {
	enabled?: boolean;
}

const useTemplate = (
	siteId: string | number,
	templateId: string,
	queryOptions: Omit< Options, 'queryKey' > = {}
): UseQueryResult< Template > => {
	return useQuery< Template >( {
		queryKey: [ siteId, 'templates', templateId ],
		queryFn: () =>
			wpcomRequest( {
				path: `/sites/${ siteId }/templates/${ templateId }`,
				apiNamespace: 'wp/v2',
			} ),
		refetchOnMount: 'always',
		staleTime: Infinity,
		...queryOptions,
	} );
};

export default useTemplate;
