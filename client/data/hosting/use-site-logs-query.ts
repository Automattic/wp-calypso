import { UseQueryOptions, useQuery } from 'react-query';
import wpcom from 'calypso/lib/wp';

interface SiteLogsAPIResponse {
	message: string;
	data: {
		total_results: number;
		logs: Record< string, any >[];
		scroll_id: string | null;
	};
}

export type SiteLogsData = SiteLogsAPIResponse[ 'data' ];

export type SiteLogsTab = 'php' | 'web';

export interface SiteLogsParams {
	logType: SiteLogsTab;
	start: number;
	end: number;
	sort_order?: 'asc' | 'desc';
	page_size?: number;
	scroll_id?: string;
}

export function useSiteLogsQuery(
	siteId: number | null | undefined,
	params: SiteLogsParams,
	queryOptions: UseQueryOptions< SiteLogsAPIResponse, unknown, SiteLogsData > = {}
) {
	return useQuery< SiteLogsAPIResponse, unknown, SiteLogsData >(
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
