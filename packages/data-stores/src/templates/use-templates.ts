import { useQuery, UseQueryResult, QueryOptions } from 'react-query';
import wpcomRequest from 'wpcom-proxy-request';
import type { Template } from './types';

interface Options extends QueryOptions< Template[], unknown > {
	enabled?: boolean;
}

const useTemplates = (
	siteId: string,
	queryOptions: Options = {}
): UseQueryResult< Template[] > => {
	return useQuery< Template[] >(
		[ siteId, 'templates' ],
		() =>
			wpcomRequest( {
				path: `/sites/${ siteId }/templates`,
				apiNamespace: 'wp/v2',
			} ),
		{
			refetchOnMount: 'always',
			staleTime: Infinity,
			...queryOptions,
		}
	);
};

export default useTemplates;
