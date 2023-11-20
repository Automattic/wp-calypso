import { useQuery } from '@tanstack/react-query';
import wpcomRequest from 'wpcom-proxy-request';
import type { Template } from './types';

interface Options {
	enabled?: boolean;
}

const fetchTemplates = ( siteId: string | number, templateId: string ): Promise< Template > =>
	wpcomRequest( {
		path: `/sites/${ siteId }/templates/${ templateId }`,
		apiNamespace: 'wp/v2',
	} );

const useTemplate = ( siteId: string | number, templateId: string, queryOptions: Options = {} ) => {
	return useQuery( {
		queryKey: [ siteId, 'templates', templateId ],
		queryFn: () => fetchTemplates( siteId, templateId ),
		refetchOnMount: 'always',
		staleTime: Infinity,
		...queryOptions,
	} );
};

export default useTemplate;
