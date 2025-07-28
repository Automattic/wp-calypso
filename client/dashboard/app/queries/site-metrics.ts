import { queryOptions } from '@tanstack/react-query';
import {
	fetchSiteHostingMetrics,
	type SiteHostingMetricsParams,
} from '../../data/site-hosting-metrics';

export const siteMetricsQuery = ( siteId: number, params: SiteHostingMetricsParams ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'metrics', params ],
		queryFn: () => fetchSiteHostingMetrics( siteId, params ),
	} );
