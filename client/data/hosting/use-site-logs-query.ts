import { UseQueryOptions, useQuery } from 'react-query';
import wpcom from 'calypso/lib/wp';

interface SiteLogsAPIResponse {
	message: string;
	data: {
		total_results: number;
		logs: object[];
		scroll_id: string | null;
	};
}

export type SiteLogs = SiteLogsAPIResponse[ 'data' ];

export interface SiteLogsParams {
	logType: 'php' | 'web';
	start: number;
	end: number;
	page_size?: number;
	scroll_id?: string;
}

export function useSiteLogsQuery(
	siteId: number | null | undefined,
	params: SiteLogsParams,
	queryOptions: UseQueryOptions< SiteLogsAPIResponse, unknown, SiteLogs > = {}
) {
	return useQuery< SiteLogsAPIResponse, unknown, SiteLogs >(
		[
			'site-logs',
			siteId,
			params.logType,
			params.start,
			params.end,
			params.page_size,
			params.scroll_id,
		],
		() => {
			const logTypeFragment = params.logType === 'php' ? 'error-logs' : 'logs';
			const path = `/sites/${ siteId }/hosting/${ logTypeFragment }`;
			return wpcom.req.post( { path, apiNamespace: 'wpcom/v2' }, params );
		},
		{
			enabled: !! siteId,
			staleTime: Infinity, // The logs within a specified time range never change.
			select( data ) {
				return data.data;
			},
			meta: {
				persist: false,
			},
			...queryOptions,
		}
	);
}
