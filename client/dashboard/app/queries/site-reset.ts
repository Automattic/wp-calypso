import {
	fetchSiteResetContentSummary,
	resetSite,
	fetchSiteResetStatus,
} from '../../data/site-reset';

export const siteResetContentSummaryQuery = ( siteId: string ) => ( {
	queryKey: [ 'site', siteId, 'reset', 'content-summary' ],
	queryFn: () => fetchSiteResetContentSummary( siteId ),
} );

export const siteResetMutation = ( siteId: string ) => ( {
	mutationFn: () => resetSite( siteId ),
} );

export const siteResetStatusQuery = ( siteId: string ) => ( {
	queryKey: [ 'site', siteId, 'reset', 'status' ],
	queryFn: () => fetchSiteResetStatus( siteId ),
} );
