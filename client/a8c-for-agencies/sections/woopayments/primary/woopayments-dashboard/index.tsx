import { Spinner } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { LayoutWithGuidedTour as Layout } from 'calypso/a8c-for-agencies/components/layout/layout-with-guided-tour';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/layout-with-payment-notification';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import useFetchLicenses from 'calypso/a8c-for-agencies/data/purchases/use-fetch-licenses';
import useFetchSitesWithPlugins from 'calypso/a8c-for-agencies/data/sites/use-fetch-sites-with-plugins';
import { LICENSES_PER_PAGE } from 'calypso/a8c-for-agencies/sections/purchases/lib/constants';
import {
	LicenseFilter,
	LicenseSortField,
	LicenseSortDirection,
} from 'calypso/jetpack-cloud/sections/partner-portal/types';
import LayoutBody from 'calypso/layout/hosting-dashboard/body';
import LayoutHeader, {
	LayoutHeaderTitle as Title,
	LayoutHeaderActions as Actions,
} from 'calypso/layout/hosting-dashboard/header';
import AddWooPaymentsToSite from '../../add-woopayments-to-site';
import { WooPaymentsProvider } from '../../context';
import WooPaymentsDashboardContent from '../../dashboard-content';
import useFetchWooPaymentsData from '../../hooks/use-fetch-woopayments-data';
import type { SitesWithWooPaymentsState, SitesWithWooPaymentsPlugins } from '../../types';
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

const WooPaymentsDashboard = () => {
	const translate = useTranslate();

	const title = translate( 'WooPayments Commissions' );

	const [ sitesWithPluginsStates, setSitesWithPluginsStates ] = useState<
		SitesWithWooPaymentsState[]
	>( [] );

	const [ isWooPaymentsDataLoading, setIsWooPaymentsDataLoading ] = useState( false );

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

	const { data: woopaymentsData, isLoading: isLoadingWooPaymentsData } =
		useFetchWooPaymentsData( isWooPaymentsDataLoading );

	const isInProgress = woopaymentsData?.status === 'in_progress';

	useEffect( () => {
		if ( isInProgress ) {
			setIsWooPaymentsDataLoading( true );
		}
	}, [ isInProgress ] );

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

	const content = useMemo( () => {
		if ( isLoadingLicensesWithWooPayments || isLoadingSitesWithPlugins ) {
			return <div>Loading...</div>;
		}

		if ( ! sitesWithPluginsStates.length ) {
			return <div>No sites with WooPayments</div>;
		}

		return <WooPaymentsDashboardContent />;
	}, [ isLoadingLicensesWithWooPayments, isLoadingSitesWithPlugins, sitesWithPluginsStates ] );

	return (
		<Layout className="woopayments-dashboard" title={ title } wide>
			<WooPaymentsProvider
				value={ {
					woopaymentsData,
					isLoadingWooPaymentsData,
					sitesWithPluginsStates,
				} }
			>
				<LayoutTop>
					<LayoutHeader>
						<Title>{ title }</Title>
						<Actions>
							<MobileSidebarNavigation />
							<div className="woopayments-dashboard__actions">
								{ isInProgress && (
									<div className="woopayments-dashboard__spinner">
										<Spinner /> { translate( 'Loading and refreshing data' ) }
									</div>
								) }
								<AddWooPaymentsToSite />
							</div>
						</Actions>
					</LayoutHeader>
				</LayoutTop>

				<LayoutBody>{ content }</LayoutBody>
			</WooPaymentsProvider>
		</Layout>
	);
};

export default WooPaymentsDashboard;
