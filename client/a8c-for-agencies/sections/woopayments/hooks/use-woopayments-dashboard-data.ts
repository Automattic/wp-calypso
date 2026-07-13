import {
	JetpackLicenseFilter,
	JetpackLicenseSortField,
	JetpackLicenseSortDirection,
} from '@automattic/api-core';
import {
	agencySitesWithPluginsQuery,
	agencyWooPaymentsDataQuery,
	jetpackAgencyLicensesQuery,
	jetpackTestConnectionQuery,
} from '@automattic/api-queries';
import { useQueries, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';
import type { SitesWithWooPaymentsState } from '../types';
import type { WooPaymentsData } from '@automattic/api-core';

const sortByState = ( a: SitesWithWooPaymentsState, b: SitesWithWooPaymentsState ): number => {
	// Order: sites without state, active, disconnected
	const getStateOrder = ( state: string | undefined | null ): number => {
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

	return getStateOrder( a.state ) - getStateOrder( b.state );
};

export interface WooPaymentsDashboardData {
	isLoading: boolean;
	showEmptyState: boolean;
	hasSites: boolean;
	woopaymentsData?: WooPaymentsData;
	isLoadingWooPaymentsData: boolean;
	sitesWithPluginsStates: SitesWithWooPaymentsState[];
}

/**
 * Orchestrates the data for the WooPayments commissions dashboard: the WooPayments licenses and
 * plugin sites the agency manages, their connection health, and the commissions data itself.
 */
export default function useWooPaymentsDashboardData(): WooPaymentsDashboardData {
	const agencyId = useSelector( getActiveAgencyId );

	const { data: licenseSites, isLoading: isLoadingLicensesWithWooPayments } = useQuery( {
		...jetpackAgencyLicensesQuery( agencyId ?? 0, {
			filter: JetpackLicenseFilter.Attached,
			search: 'woopayments',
			sortField: JetpackLicenseSortField.IssuedAt,
			sortDirection: JetpackLicenseSortDirection.Descending,
		} ),
		enabled: !! agencyId,
		refetchOnWindowFocus: false,
		select: ( licenses ) =>
			licenses.map( ( license ) => ( {
				blogId: license.blog_id ?? 0,
				siteUrl: license.siteurl ?? '',
				state: '',
			} ) ),
	} );

	const { isLoading: isLoadingSitesWithPlugins, data: sitesWithPlugins } = useQuery( {
		...agencySitesWithPluginsQuery( agencyId ?? 0, [
			'woocommerce-payments/woocommerce-payments',
		] ),
		enabled: !! agencyId,
		refetchOnWindowFocus: false,
	} );

	const sitesWithWooPaymentsPlugins = useMemo( () => {
		return (
			sitesWithPlugins?.map( ( site ) => ( {
				blogId: site.blog_id,
				siteUrl: site.url,
				state: site.state,
			} ) ) || []
		);
	}, [ sitesWithPlugins ] );

	// Combine sites with WooPayments licenses (assigned via A4A) and plugins.
	const allSitesWithWooPayments = useMemo( () => {
		return [ ...( licenseSites || [] ), ...sitesWithWooPaymentsPlugins ];
	}, [ licenseSites, sitesWithWooPaymentsPlugins ] );

	const testConnectionResults = useQueries( {
		queries: allSitesWithWooPayments.map( ( site ) => ( {
			...jetpackTestConnectionQuery( site.blogId ?? 0, true ),
			staleTime: 1000 * 60,
			enabled: allSitesWithWooPayments.length > 0,
		} ) ),
		combine: ( results ) => results.map( ( result ) => result.data?.connected ?? true ),
	} );

	const testConnections = allSitesWithWooPayments.map( ( site, index ) => ( {
		ID: site.blogId,
		connected: testConnectionResults[ index ] ?? true,
	} ) );

	const isLoading = isLoadingLicensesWithWooPayments || isLoadingSitesWithPlugins;
	const showEmptyState = ! isLoading && ! allSitesWithWooPayments.length;

	// Only fetch data if there are sites with WooPayments plugins or licenses.
	const { data: woopaymentsData, isLoading: isLoadingWooPaymentsData } = useQuery( {
		...agencyWooPaymentsDataQuery( agencyId ?? 0 ),
		enabled: !! agencyId && !! allSitesWithWooPayments.length,
	} );

	const sitesWithPluginsStates = useMemo( () => {
		return Array.from(
			new Map( allSitesWithWooPayments.map( ( site ) => [ site.blogId, site ] ) ).values() // Remove duplicates
		)
			.map( ( site: SitesWithWooPaymentsState ) => {
				const connection = testConnections?.find( ( connection ) => connection.ID === site.blogId );
				return {
					...site,
					state: connection?.connected === false ? 'disconnected' : site.state,
				};
			} )
			.sort( sortByState );
	}, [ allSitesWithWooPayments, testConnections ] );

	return {
		isLoading,
		showEmptyState,
		hasSites: allSitesWithWooPayments.length > 0,
		woopaymentsData,
		isLoadingWooPaymentsData,
		sitesWithPluginsStates,
	};
}
