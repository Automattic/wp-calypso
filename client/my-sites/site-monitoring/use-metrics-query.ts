import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';

export type SiteMetricsAPIResponse = {
	message?: string;
	data: {
		_meta?: MetaData;
		periods: PeriodData[];
	};
};

export type PeriodData = {
	timestamp: number;
	dimension: { [ key: string ]: number };
};

export type MetaData = {
	start: number;
	end: number;
	resolution: number;
	metric: string;
	dimension: string;
	took: number;
};

export interface SiteMetricsParams {
	start: number;
	end: number;
	metric?: MetricsParams[ 'metric' ]; // Use MetricsParams['metric'] instead of MetricsParams
	dimension?: DimensionParams;
}

export type DimensionParams =
	| 'http_version'
	| 'http_verb'
	| 'http_host'
	| 'http_status'
	| 'page_renderer'
	| 'page_is_cached'
	| 'wp_admin_ajax_action'
	| 'visitor_asn'
	| 'visitor_country_code'
	| 'visitor_is_crawler';

export type MetricsParams = {
	metric?: MetricsType;
};

export type MetricsType =
	| 'requests_persec'
	| 'response_bytes_persec'
	| 'response_bytes_average'
	| 'response_time_average';

export function useSiteMetricsQuery(
	siteId: number | null | undefined,
	params: SiteMetricsParams,
	enableQuery: boolean = true
) {
	const queryResult = useQuery< SiteMetricsAPIResponse >( {
		queryKey: buildQueryKey( siteId, params ),
		queryFn: () => {
			const path = `/sites/${ siteId }/hosting/metrics`;
			return wpcom.req.get(
				{ path, apiNamespace: 'wpcom/v2' },
				{
					start: params.start,
					end: params.end,
					metric: params.metric,
					dimension: params.dimension,
				}
			);
		},
		meta: {
			persist: false,
		},
		staleTime: Infinity,
		enabled: enableQuery,
	} );

	const { refetch, ...remainingQueryResults } = queryResult;

	return {
		...remainingQueryResults,
	};

	function buildQueryKey( siteId: number | null | undefined, params: SiteMetricsParams ) {
		return [
			'SITE_MONITORING_METRICS_QUERY',
			siteId,
			params.start,
			params.end,
			params.metric,
			params.dimension,
		];
	}
}
