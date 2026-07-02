import {
	fetchAgencyWooPaymentsCommissions,
	fetchAgencyWooPaymentsLicensedSites,
	fetchAgencyWooPaymentsPluginSites,
} from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const agencyWooPaymentsCommissionsQuery = ( agencyId: number ) =>
	queryOptions( {
		queryKey: [ 'woopayments', 'commissions', agencyId ] as const,
		queryFn: () => fetchAgencyWooPaymentsCommissions( agencyId ),
		enabled: !! agencyId,
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
