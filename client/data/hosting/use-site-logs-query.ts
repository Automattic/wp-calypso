import { useState } from 'react';
import { UseQueryOptions, useQuery } from 'react-query';
import wpcom from 'calypso/lib/wp';

interface SiteLogsAPIResponse {
	message: string;
	data: {
		total_results: number | { value: number; relation: string };
		logs: Record< string, unknown >[];
		scroll_id: string | null;
	};
}

export type SiteLogsData = {
	total_results: number;
	logs: Record< string, unknown >[];
	scroll_id: string | null;
};

export type SiteLogsTab = 'php' | 'web';

export interface SiteLogsParams {
	logType: SiteLogsTab;
	start: number;
	end: number;
	sortOrder?: 'asc' | 'desc';
	pageSize?: number;
	pageIndex?: number;
}

export function useSiteLogsQuery(
	siteId: number | null | undefined,
	params: SiteLogsParams,
	queryOptions: UseQueryOptions< SiteLogsAPIResponse, unknown, SiteLogsData > = {}
) {
	const [ scrollId, setScrollId ] = useState< string | undefined >();
	const [ isFinishedPaging, setIsFinishedPaging ] = useState< boolean >( false );

	const queryResult = useQuery< SiteLogsAPIResponse, unknown, SiteLogsData >(
		buildQueryKey( siteId, params ),
		() => {
			const logTypeFragment = params.logType === 'php' ? 'error-logs' : 'logs';
			const path = `/sites/${ siteId }/hosting/${ logTypeFragment }`;
			return wpcom.req.post(
				{ path, apiNamespace: 'wpcom/v2' },
				{
					start: params.start,
					end: params.end,
					sort_order: params.sortOrder,
					page_size: params.pageSize,
					scroll_id: scrollId,
				}
			);
		},
		{
			enabled: !! siteId,
			staleTime: Infinity, // The logs within a specified time range never change.
			select( { data } ) {
				return {
					...data,
					total_results:
						typeof data.total_results === 'number' ? data.total_results : data.total_results.value,
				};
			},
			onSuccess( data ) {
				if ( data.scroll_id ) {
					setScrollId( data.scroll_id );
				} else {
					setIsFinishedPaging( true );
				}

				if ( queryOptions.onSuccess ) {
					return queryOptions.onSuccess( data );
				}
			},
			meta: {
				persist: false,
			},
			...queryOptions,
		}
	);

	// The state represented by scroll ID will have already advanced to the next page, so we
	// can't allow `refetch` to be used. Remember, the logs are fetched with a POST and the
	// requests are not idempotent.
	const { refetch, ...remainingQueryResults } = queryResult;

	return {
		isFinishedPaging,
		...remainingQueryResults,
	};
}

function buildQueryKey( siteId: number | null | undefined, params: SiteLogsParams ) {
	return [
		params.logType === 'php' ? 'site-logs-php' : 'site-logs-web',
		siteId,
		params.start,
		params.end,
		params.sortOrder,
		params.pageSize,
		params.pageIndex,
	];
}
