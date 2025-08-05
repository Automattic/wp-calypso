import { queryOptions, mutationOptions } from '@tanstack/react-query';
import {
	fetchSiteResetContentSummary,
	resetSite,
	fetchSiteResetStatus,
} from '../../data/site-reset';

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
