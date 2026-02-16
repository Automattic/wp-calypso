import { useDesktopBreakpoint } from '@automattic/viewport-react';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { LayoutWithGuidedTour as Layout } from 'calypso/a8c-for-agencies/components/layout/layout-with-guided-tour';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/layout-with-payment-notification';
import { PageBodyPlaceholder } from 'calypso/a8c-for-agencies/components/page-placeholder';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import useFetchAllLicenses from 'calypso/a8c-for-agencies/data/purchases/use-fetch-all-licenses';
import useFetchSitesWithPlugins from 'calypso/a8c-for-agencies/data/sites/use-fetch-sites-with-plugins';
import MissingPaymentSettingsNotice from 'calypso/a8c-for-agencies/sections/referrals/common/missing-payment-settings-notice';
import { useFetchTestConnections } from 'calypso/a8c-for-agencies/sections/sites/hooks/use-fetch-test-connection';
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
import WooPaymentsDashboardEmptyState from './empty-state';
import type { Site } from '../../../sites/types';
import type { SitesWithWooPaymentsState, SitesWithWooPaymentsPlugins } from '../../types';

import './style.scss';

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

	const orderA = getStateOrder( a.state );
	const orderB = getStateOrder( b.state );

	return orderA - orderB;
};

const WooPaymentsDashboard = () => {
	const translate = useTranslate();

	const isDesktop = useDesktopBreakpoint();

	const title = translate( 'WooPayments commissions' );

	const { data: licensesWithWooPayments, isLoading: isLoadingLicensesWithWooPayments } =
		useFetchAllLicenses(
			LicenseFilter.Attached,
			'woopayments',
			LicenseSortField.IssuedAt,
			LicenseSortDirection.Descending
		);

	const { isLoading: isLoadingSitesWithPlugins, data: sitesWithPlugins } = useFetchSitesWithPlugins(
		[ 'woocommerce-payments/woocommerce-payments' ]
	);

	const sitesWithWooPaymentsPlugins = useMemo( () => {
		return (
			sitesWithPlugins?.map( ( site: SitesWithWooPaymentsPlugins ) => {
				return {
					blogId: site.blog_id,
					siteUrl: site.url,
					state: site.state,
				};
			} ) || []
		);
	}, [ sitesWithPlugins ] );

	// Combine sites with WooPayments licenses (assigned via A4A) and plugins
	const allSitesWithWooPayments = useMemo( () => {
		return [ ...( licensesWithWooPayments?.items || [] ), ...sitesWithWooPaymentsPlugins ];
	}, [ licensesWithWooPayments, sitesWithWooPaymentsPlugins ] );

	const testConnections = useFetchTestConnections(
		true,
		allSitesWithWooPayments.map( ( site: SitesWithWooPaymentsState ) => {
			return {
				blog_id: site.blogId,
				is_connection_healthy: true,
			} as Site;
		} ) || []
	);

	const isLoading = isLoadingLicensesWithWooPayments || isLoadingSitesWithPlugins;
	const showEmptyState = ! isLoading && ! allSitesWithWooPayments.length;

	const { data: woopaymentsData, isLoading: isLoadingWooPaymentsData } = useFetchWooPaymentsData(
		!! allSitesWithWooPayments.length // Only fetch data if there are sites with WooPayments plugins or licenses
	);

	const sortedSitesWithWooPayments = useMemo( () => {
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

	const content = useMemo( () => {
		if ( isLoading ) {
			return <PageBodyPlaceholder />;
		}

		if ( showEmptyState ) {
			return <WooPaymentsDashboardEmptyState />;
		}

		return <WooPaymentsDashboardContent />;
	}, [ isLoading, showEmptyState ] );

	const isFullWidth = ! showEmptyState && isDesktop && ! isLoading;

	return (
		<Layout
			className={ clsx( 'woopayments-dashboard', {
				'is-empty': showEmptyState,
				'full-width-layout-with-table': isFullWidth,
			} ) }
			title={ title }
			wide
		>
			<WooPaymentsProvider
				value={ {
					woopaymentsData,
					isLoadingWooPaymentsData,
					sitesWithPluginsStates: sortedSitesWithWooPayments,
				} }
			>
				<LayoutTop isFullWidth={ isFullWidth }>
					{ !! allSitesWithWooPayments.length && (
						<MissingPaymentSettingsNotice commissionType="woopayments" />
					) }
					<LayoutHeader>
						<Title>{ title }</Title>
						<Actions>
							<MobileSidebarNavigation />
							<div className="woopayments-dashboard__actions">
								{ ! isLoading && <AddWooPaymentsToSite /> }
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
