import { fetchSiteHostingMetrics, type SiteHostingMetricsParams } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const siteMetricsQuery = ( siteId: number, params: SiteHostingMetricsParams ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'metrics', params ],
		queryFn: () => fetchSiteHostingMetrics( siteId, params ),
	} );
