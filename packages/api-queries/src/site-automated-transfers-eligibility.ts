import { fetchSiteAutomatedTransfersEligibility } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const siteAutomatedTransfersEligibilityQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'automated-transfers', 'eligibility' ],
		queryFn: () => fetchSiteAutomatedTransfersEligibility( siteId ),
	} );
