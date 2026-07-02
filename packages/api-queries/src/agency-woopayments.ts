import {
	fetchAgencyWooPaymentsCommissions,
	fetchAgencyWooPaymentsLicensedSites,
	fetchAgencyWooPaymentsPluginSites,
	fetchSiteTestConnection,
} from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const agencyWooPaymentsCommissionsQuery = ( agencyId: number, enabled = true ) =>
	queryOptions( {
		queryKey: [ 'woopayments', 'commissions', agencyId ] as const,
		queryFn: () => fetchAgencyWooPaymentsCommissions( agencyId ),
		enabled: !! agencyId && enabled,
		staleTime: 0,
		refetchOnWindowFocus: true,
	} );

export const agencyWooPaymentsLicensedSitesQuery = ( agencyId: number ) =>
	queryOptions( {
		queryKey: [ 'woopayments', 'licensed-sites', agencyId ] as const,
		queryFn: () => fetchAgencyWooPaymentsLicensedSites( agencyId ),
		enabled: !! agencyId,
		refetchOnWindowFocus: false,
	} );

export const agencyWooPaymentsPluginSitesQuery = ( agencyId: number ) =>
	queryOptions( {
		queryKey: [ 'woopayments', 'plugin-sites', agencyId ] as const,
		queryFn: () => fetchAgencyWooPaymentsPluginSites( agencyId ),
		enabled: !! agencyId,
		refetchOnWindowFocus: false,
		staleTime: 0,
	} );

export const siteTestConnectionQuery = ( blogId: number ) =>
	queryOptions( {
		queryKey: [ 'site', blogId, 'test-connection' ] as const,
		queryFn: () => fetchSiteTestConnection( blogId ),
		enabled: !! blogId,
		refetchOnWindowFocus: false,
	} );
