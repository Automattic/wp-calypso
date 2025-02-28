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
import WooPaymentsConsolidatedViews from './consolidated-views';
import SitesWithWooPayments from './sites-with-woopayments';
import { WooPaymentsProvider } from './woopayments-context';
import type { SitesWithWooPaymentsState, SitesWithWooPaymentsPlugins } from '../types';
import type { License } from 'calypso/state/partner-portal/types';

import './style.scss';

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

	const { data: woopaymentsData, isFetching: isLoadingWooPaymentsData } = useFetchWooPaymentsData();

	const createInitialSiteState = useCallback(
		( license: License ) => {
			const sitePlugin = sitesWithPlugins.find(
				( site: SitesWithWooPaymentsPlugins ) => site.blog_id === license.blogId
			);

			return {
				blogId: license.blogId,
				siteUrl: license.siteUrl,
				state: sitePlugin?.state || null,
			} as SitesWithWooPaymentsState;
		},
		[ sitesWithPlugins ]
	);

	useEffect( () => {
		if ( ! sitesWithPlugins?.length || ! licensesWithWooPayments?.items ) {
			return;
		}

		const states = licensesWithWooPayments.items.map( createInitialSiteState ).sort( sortByState );

		setSitesWithPluginsStates( states );
	}, [ sitesWithPlugins, licensesWithWooPayments, createInitialSiteState ] );

	if ( isLoadingLicensesWithWooPayments || isLoadingSitesWithPlugins ) {
		return <div>Loading...</div>;
	}

	if ( ! sitesWithPluginsStates.length ) {
		return <div>No sites with WooPayments</div>;
	}

	return (
		<WooPaymentsProvider
			value={ {
				woopaymentsData,
				isLoadingWooPaymentsData,
			} }
		>
			<WooPaymentsConsolidatedViews />
			<SitesWithWooPayments items={ sitesWithPluginsStates } />
		</WooPaymentsProvider>
	);
};

export default WooPaymentsDashboardContent;
