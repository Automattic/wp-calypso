import { useQuery, UseQueryResult } from '@tanstack/react-query';
import wpcomRequest from 'wpcom-proxy-request';
import { APIError } from './use-site-reset-mutation';

export type SiteContent = {
	post_count: number;
	page_count: number;
	media_count: number;
	plugin_count: number;
};

export const useSiteResetContentSummaryQuery = (
	siteId: number
): UseQueryResult< SiteContent, APIError > => {
	const queryKey = [ 'site-reset-content', siteId ];

	return useQuery< SiteContent, APIError >( {
		queryKey,
		queryFn: () => {
			return wpcomRequest( {
				path: `/sites/${ siteId }/reset-site/content-summary`,
				apiNamespace: 'wpcom/v2',
			} );
		},
	} );
};
