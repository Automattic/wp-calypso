import {
	activeAgencyQuery,
	agencyWooPaymentsCommissionsQuery,
	agencyWooPaymentsLicensedSitesQuery,
	agencyWooPaymentsPluginSitesQuery,
	siteTestConnectionQuery,
} from '@automattic/api-queries';
import { useQueries, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { AgencyWooPaymentsData, AgencyWooPaymentsSiteState } from '@automattic/api-core';

type WooPaymentsDashboardData = {
	sites: AgencyWooPaymentsSiteState[];
	isLoading: boolean;
	hasSites: boolean;
	commissions?: AgencyWooPaymentsData;
	isLoadingCommissions: boolean;
};

const stateOrder = ( state: string | undefined | null ): number => {
	if ( ! state ) {
		return 0;
	}
	if ( state === 'active' ) {
		return 1;
	}
	if ( state === 'disconnected' ) {
		return 2;
	}
	return 3;
};

export function useWooPaymentsDashboardData(): WooPaymentsDashboardData {
	const { data: agency } = useQuery( activeAgencyQuery() );
	const agencyId = agency?.id ?? 0;

	const { data: licensedSites = [], isLoading: isLoadingLicensed } = useQuery(
		agencyWooPaymentsLicensedSitesQuery( agencyId )
	);
	const { data: pluginSites = [], isLoading: isLoadingPlugins } = useQuery(
		agencyWooPaymentsPluginSitesQuery( agencyId )
	);

	const mergedSites = useMemo( () => {
		const all: AgencyWooPaymentsSiteState[] = [ ...licensedSites, ...pluginSites ];
		return Array.from( new Map( all.map( ( s ) => [ s.blogId, s ] ) ).values() );
	}, [ licensedSites, pluginSites ] );

	const connectionResults = useQueries( {
		queries: mergedSites.map( ( s ) => siteTestConnectionQuery( s.blogId ) ),
	} );
	const connectionData = connectionResults.map( ( r ) => r.data );
	const connectionDataKey = connectionData.join( '|' );

	const sites = useMemo( () => {
		return mergedSites
			.map( ( site, index ) => {
				const connected = connectionData[ index ];
				return { ...site, state: connected === false ? 'disconnected' : site.state };
			} )
			.sort( ( a, b ) => stateOrder( a.state ) - stateOrder( b.state ) );
		// connectionData is derived fresh each render; connectionDataKey is its stable proxy.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ mergedSites, connectionDataKey ] );

	const isLoading = isLoadingLicensed || isLoadingPlugins;
	const hasSites = sites.length > 0;

	const { data: commissions, isLoading: isLoadingCommissions } = useQuery( {
		...agencyWooPaymentsCommissionsQuery( agencyId ),
		enabled: !! agencyId && hasSites,
	} );

	return {
		sites,
		isLoading,
		hasSites,
		commissions: commissions as AgencyWooPaymentsData | undefined,
		isLoadingCommissions,
	};
}
