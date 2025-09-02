import {
	fetchSiteResetContentSummary,
	resetSite,
	fetchSiteResetStatus,
} from '@automattic/api-core';
import { queryOptions, mutationOptions } from '@tanstack/react-query';

export const siteResetContentSummaryQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'reset', 'content-summary' ],
		queryFn: () => fetchSiteResetContentSummary( siteId ),
	} );

export const siteResetMutation = ( siteId: number ) =>
	mutationOptions( {
		mutationFn: () => resetSite( siteId ),
	} );

export const siteResetStatusQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'reset', 'status' ],
		queryFn: () => fetchSiteResetStatus( siteId ),
	} );
