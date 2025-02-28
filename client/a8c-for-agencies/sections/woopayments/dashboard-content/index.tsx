import { useState, useEffect, useCallback } from 'react';
import useFetchLicenses from 'calypso/a8c-for-agencies/data/purchases/use-fetch-licenses';
import useFetchSitesWithPlugins from 'calypso/a8c-for-agencies/data/sites/use-fetch-sites-with-plugins';
import { LICENSES_PER_PAGE } from 'calypso/a8c-for-agencies/sections/purchases/lib/constants';
import {
	LicenseFilter,
	LicenseSortField,
	LicenseSortDirection,
} from 'calypso/jetpack-cloud/sections/partner-portal/types';
import useFetchWooPaymentsData from '../hooks/use-fetch-woopayments-data';
import SitesWithWooPayments from './sites-with-woopayments';
import type { SitesWithWooPaymentsState, SitesWithWooPaymentsPlugins } from '../types';
import type { License } from 'calypso/state/partner-portal/types';

const sortByState = ( a: SitesWithWooPaymentsState, b: SitesWithWooPaymentsState ) => {
	// Sites without state go first
	if ( ! a.state && b.state ) {
		return -1;
	}
	if ( a.state && ! b.state ) {
		return 1;
	}
	return 0;
};

const WooPaymentsDashboardContent = () => {
	const [ sitesWithPluginsStates, setSitesWithPluginsStates ] = useState<
		SitesWithWooPaymentsState[]
	>( [] );

	const { data: licensesWithWooPayments, isLoading: isLoadingLicensesWithWooPayments } =
		useFetchLicenses(
			LicenseFilter.Attached,
			'woopayments',
			LicenseSortField.IssuedAt,
			LicenseSortDirection.Descending,
			1,
			LICENSES_PER_PAGE
		);

	const { isLoading: isLoadingSitesWithPlugins, data: sitesWithPlugins } = useFetchSitesWithPlugins(
		[ 'woocommerce-payments/woocommerce-payments' ]
	);

	const { data: woopaymentsData } = useFetchWooPaymentsData( {} );

	const createInitialSiteState = useCallback(
		( license: License ) => {
			const sitePlugin = sitesWithPlugins.find(
				( site: SitesWithWooPaymentsPlugins ) => site.blog_id === license.blogId
			);

			return {
				blogId: license.blogId,
				siteUrl: license.siteUrl,
				state: sitePlugin?.state || null,
				transactions: 0,
			} as SitesWithWooPaymentsState;
		},
		[ sitesWithPlugins ]
	);

	const updateSitesWithTransactions = useCallback(
		( currentStates: SitesWithWooPaymentsState[] ) =>
			currentStates.map( ( site ) => ( {
				...site,
				transactions: woopaymentsData?.sites?.[ String( site.blogId ) ]?.tpv ?? 0,
				payout: woopaymentsData?.sites?.[ String( site.blogId ) ]?.payout ?? 0,
			} ) ),
		[ woopaymentsData ]
	);

	// Initial setup of sites without transactions
	useEffect( () => {
		if ( ! sitesWithPlugins?.length || ! licensesWithWooPayments?.items ) {
			return;
		}

		const states = licensesWithWooPayments.items.map( createInitialSiteState ).sort( sortByState );

		setSitesWithPluginsStates( states );
	}, [ sitesWithPlugins, licensesWithWooPayments, createInitialSiteState ] );

	// Update transactions when woopaymentsData arrives
	useEffect( () => {
		if ( ! woopaymentsData || ! sitesWithPluginsStates.length ) {
			return;
		}

		setSitesWithPluginsStates( updateSitesWithTransactions );
	}, [ woopaymentsData, updateSitesWithTransactions, sitesWithPluginsStates.length ] );

	if ( isLoadingLicensesWithWooPayments || isLoadingSitesWithPlugins ) {
		return <div>Loading...</div>;
	}

	if ( ! sitesWithPluginsStates.length ) {
		return <div>No sites with WooPayments</div>;
	}

	return <SitesWithWooPayments items={ sitesWithPluginsStates } />;
};

export default WooPaymentsDashboardContent;
