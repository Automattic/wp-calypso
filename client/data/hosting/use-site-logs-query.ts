import { useState } from 'react';
import { UseQueryOptions, useQuery, useQueryClient } from 'react-query';
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
	const queryClient = useQueryClient();
	const [ scrollId, setScrollId ] = useState< string | undefined >();
	const [ isFinishedPaging, setIsFinishedPaging ] = useState< boolean >( false );

	// The scroll ID represents the state of a particular set of filtering arguments. If any of
	// those filter arguments change we throw out the scroll ID so we can start over.
	const [ previousSiteId, setPreviousSiteId ] = useState( siteId );
	const [ previousParams, setPreviousParams ] = useState( params );
	if ( previousSiteId !== siteId || ! areRequestParamsEqual( previousParams, params ) ) {
		queryClient.removeQueries( {
			queryKey: buildPartialQueryKey( previousSiteId, previousParams ),
		} );

		// We're updating state directly in the render flow. This is preferable to using an effect.
		// https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
		setPreviousSiteId( siteId );
		setPreviousParams( params );
		setScrollId( undefined );
	}

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
			enabled: !! siteId && params.start <= params.end,
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

function buildPartialQueryKey( siteId: number | null | undefined, params: SiteLogsParams ) {
	return [ params.logType === 'php' ? 'site-logs-php' : 'site-logs-web', siteId ];
}

function buildQueryKey( siteId: number | null | undefined, params: SiteLogsParams ) {
	return [
		...buildPartialQueryKey( siteId, params ),
		params.start,
		params.end,
		params.sortOrder,
		params.pageSize,
		params.pageIndex,
	];
}

// Request params are equal if every field is the same _except_ for the page index.
// The page index is not part of the request body, it is only part of the query key.
function areRequestParamsEqual( a: SiteLogsParams, b: SiteLogsParams ) {
	return (
		a.logType === b.logType &&
		a.start === b.start &&
		a.end === b.end &&
		a.sortOrder === b.sortOrder &&
		a.pageSize === b.pageSize
	);
}
