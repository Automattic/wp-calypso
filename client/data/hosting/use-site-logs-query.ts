import { UseQueryOptions, keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
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
	has_more: boolean;
};

export type SiteLogsTab = 'php' | 'web';

export interface FilterType {
	[ key: string ]: Array< string >;
}

export interface SiteLogsParams {
	logType: SiteLogsTab;
	start: number;
	end: number;
	filter: FilterType;
	sortOrder?: 'asc' | 'desc';
	pageSize?: number;
	pageIndex?: number;
}

export function useSiteLogsQuery(
	siteId: number | null | undefined,
	params: SiteLogsParams,
	queryOptions: Omit<
		UseQueryOptions< SiteLogsAPIResponse, unknown, SiteLogsData >,
		'queryKey'
	> = {}
) {
	const queryClient = useQueryClient();
	const [ scrollId, setScrollId ] = useState< string | undefined >();

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

	const queryResult = useQuery< SiteLogsAPIResponse, unknown, SiteLogsData >( {
		queryKey: buildQueryKey( siteId, params ),
		queryFn: () => {
			const logTypeFragment = params.logType === 'php' ? 'error-logs' : 'logs';
			const path = `/sites/${ siteId }/hosting/${ logTypeFragment }`;
			return wpcom.req.get(
				{ path, apiNamespace: 'wpcom/v2' },
				{
					start: params.start,
					end: params.end,
					filter: params.filter,
					sort_order: params.sortOrder,
					page_size: params.pageSize,
					scroll_id: scrollId,
				}
			);
		},
		placeholderData: keepPreviousData,
		enabled: !! siteId && params.start <= params.end,
		staleTime: Infinity, // The logs within a specified time range never change.
		select( { data } ) {
			return {
				...data,
				has_more: !! data.scroll_id,
				total_results:
					typeof data.total_results === 'number' ? data.total_results : data.total_results.value,
			};
		},
		meta: {
			persist: false,
		},
		...queryOptions,
	} );

	const { data } = queryResult;

	useEffect( () => {
		if ( data?.has_more && scrollId !== data.scroll_id ) {
			setScrollId( data.scroll_id ?? undefined );
		}
	}, [ data, scrollId ] );

	// The state represented by scroll ID will have already advanced to the next page, so we
	// can't allow `refetch` to be used. Remember, the logs are fetched with a POST and the
	// requests are not idempotent.
	const { refetch, ...remainingQueryResults } = queryResult;

	return {
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
		params.filter,
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
		a.pageSize === b.pageSize &&
		areFilterParamsEqual( a.filter, b.filter )
	);
}

function areFilterParamsEqual( a: FilterType, b: FilterType ) {
	for ( const filter in a ) {
		if ( ! b.hasOwnProperty( filter ) ) {
			return false;
		}

		if ( a[ filter ].toString() !== b[ filter ].toString() ) {
			return false;
		}
	}

	for ( const filter in b ) {
		if ( ! a.hasOwnProperty( filter ) ) {
			return false;
		}

		if ( b[ filter ].toString() !== a[ filter ].toString() ) {
			return false;
		}
	}

	return true;
}
