import { useQuery, UseQueryResult, QueryOptions } from 'react-query';
import wpcomRequest from 'wpcom-proxy-request';
import type { Template } from './types';

interface Options extends QueryOptions< Template, unknown > {
	enabled?: boolean;
}

const useTemplates = (
	siteId: string | number,
	templateId: string,
	queryOptions: Options = {}
): UseQueryResult< Template > => {
	return useQuery< Template >(
		[ siteId, 'templates', templateId ],
		() =>
			wpcomRequest( {
				path: `/sites/${ siteId }/templates/${ templateId }`,
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
