import { UseQueryOptions, keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import wpcom from 'calypso/lib/wp';

interface SiteLogsAPIResponse {
	message: string;
	data: {
		total_results: number | { value: number; relation: string };
		logs: (PHPLogFromEndpoint | ServerLogFromEndpoint)[];
		scroll_id: string | null;
	};
}

interface SiteLogsData {
	total_results: number;
	logs: (ServerLog | PHPLog)[];
	scroll_id: string | null;
	has_more: boolean;
}

interface ServerLogFromEndpoint {
	date: string;
	request_type: 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE';
	status: '200' | '301' | '302' | '400' | '401' | '403' | '404' | '429' | '500';
	request_url: string;
	body_bytes_sent: number;
	cached: string;
	http_host: string;
	http_referer: string;
	http2: string;
	http_user_agent: string;
	http_version: string;
	http_x_forwarded_for: string;
	renderer: string;
	request_completion: string;
	request_time: string;
	scheme: string;
	timestamp: number;
	type: string;
	user_ip: string;
}

export interface ServerLog extends ServerLogFromEndpoint {
	id: string;
}

interface PHPLogFromEndpoint {
	timestamp: string;
	severity: 'User' | 'Warning' | 'Deprecated' | 'Fatal error';
	message: string;
	kind: string;
	name: string;
	file: string;
	line: number;
	atomic_site_id: number;
}

export interface PHPLog extends Omit<PHPLogFromEndpoint, 'atomic_site_id'> {
	id: string;
}

export enum LogType {
	PHP = 'php',
	WEB = 'web',
}

export interface LogQueryParams {
	from: string;
	to: string;
	// PHP filters
	severity: string;
	// Web filters
	request_type: string;
	status: string;
	renderer: string;
	cached: string;
}

export interface FilterType {
	[key: string]: Array<string>;
}

interface SiteLogsParams {
	logType: LogType;
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
	queryOptions: Omit<UseQueryOptions<SiteLogsAPIResponse, unknown, SiteLogsData>, 'queryKey'> = {}
) {
	const queryClient = useQueryClient();
	const [scrollId, setScrollId] = useState<string | undefined>();

	// The scroll ID represents the state of a particular set of filtering arguments. If any of
	// those filter arguments change we throw out the scroll ID so we can start over.
	const [previousSiteId, setPreviousSiteId] = useState(siteId);
	const [previousParams, setPreviousParams] = useState(params);
	if (previousSiteId !== siteId || !areRequestParamsEqual(previousParams, params)) {
		queryClient.removeQueries({
			queryKey: buildPartialQueryKey(previousSiteId, previousParams),
		});

		// We're updating state directly in the render flow. This is preferable to using an effect.
		// https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
		setPreviousSiteId(siteId);
		setPreviousParams(params);
		setScrollId(undefined);
	}

	const queryResult = useQuery<SiteLogsAPIResponse, unknown, SiteLogsData>({
		queryKey: buildQueryKey(siteId, params),
		queryFn: () => {
			const logTypeFragment = params.logType === LogType.PHP ? 'error-logs' : 'logs';
			const path = `/sites/${siteId}/hosting/${logTypeFragment}`;
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
		enabled: !!siteId && params.start <= params.end,
		staleTime: Infinity, // The logs within a specified time range never change.
		select({ data }: SiteLogsAPIResponse): SiteLogsData {
			return {
				has_more: !!data.scroll_id,
				total_results:
					typeof data.total_results === 'number' ? data.total_results : data.total_results.value,
				logs: data.logs.map(({ atomic_site_id, ...restLog }: any, key) => {
					return {
						...restLog,
						id: String(key),
					};
				}),
				scroll_id: data.scroll_id,
			};
		},
		meta: {
			persist: false,
		},
		...queryOptions,
	});

	const { data } = queryResult;

	useEffect(() => {
		if (data?.has_more && scrollId !== data.scroll_id) {
			setScrollId(data.scroll_id ?? undefined);
		}
	}, [data, scrollId]);

	// The state represented by scroll ID will have already advanced to the next page, so we
	// can't allow `refetch` to be used. Remember, the logs are fetched with a POST and the
	// requests are not idempotent.
	const { refetch, ...remainingQueryResults } = queryResult;

	return {
		...remainingQueryResults,
	};
}

function buildPartialQueryKey(siteId: number | null | undefined, params: SiteLogsParams) {
	return [params.logType === LogType.PHP ? 'site-logs-php' : 'site-logs-web', siteId];
}

function buildQueryKey(siteId: number | null | undefined, params: SiteLogsParams) {
	return [
		...buildPartialQueryKey(siteId, params),
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
function areRequestParamsEqual(a: SiteLogsParams, b: SiteLogsParams) {
	return (
		a.logType === b.logType &&
		a.start === b.start &&
		a.end === b.end &&
		a.sortOrder === b.sortOrder &&
		a.pageSize === b.pageSize &&
		areFilterParamsEqual(a.filter, b.filter)
	);
}

function areFilterParamsEqual(a: FilterType, b: FilterType) {
	for (const filter in a) {
		if (!b.hasOwnProperty(filter)) {
			return false;
		}

		if (a[filter].toString() !== b[filter].toString()) {
			return false;
		}
	}

	for (const filter in b) {
		if (!a.hasOwnProperty(filter)) {
			return false;
		}

		if (b[filter].toString() !== a[filter].toString()) {
			return false;
		}
	}

	return true;
}
