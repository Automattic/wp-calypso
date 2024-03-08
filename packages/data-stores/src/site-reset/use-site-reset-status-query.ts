import { useQuery, UseQueryResult } from '@tanstack/react-query';
import wpcomRequest from 'wpcom-proxy-request';
import { APIError } from './use-site-reset-mutation';

export type SiteResetStatus = {
	status: 'in-progress' | 'ready';
	progress: number;
};

export const useSiteResetStatusQuery = (
	siteId: number
): UseQueryResult< SiteResetStatus, APIError > => {
	const queryKey = [ 'site-reset-status', siteId ];

	return useQuery< SiteResetStatus, APIError >( {
		queryKey,
		queryFn: () => {
			return wpcomRequest( {
				path: `/sites/${ siteId }/reset-site/status`,
				apiNamespace: 'wpcom/v2',
			} );
		},
	} );
};
