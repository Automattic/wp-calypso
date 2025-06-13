import {
	fetchSiteResetContentSummary,
	resetSite,
	fetchSiteResetStatus,
} from '../../data/site-reset';

export const siteResetContentSummaryQuery = ( siteId: number ) => ( {
	queryKey: [ 'site', siteId, 'reset', 'content-summary' ],
	queryFn: () => fetchSiteResetContentSummary( siteId ),
} );

export const siteResetMutation = ( siteId: number ) => ( {
	mutationFn: () => resetSite( siteId ),
} );

export const siteResetStatusQuery = ( siteId: number ) => ( {
	queryKey: [ 'site', siteId, 'reset', 'status' ],
	queryFn: () => fetchSiteResetStatus( siteId ),
} );
