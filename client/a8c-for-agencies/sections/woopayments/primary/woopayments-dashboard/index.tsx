import {
	agencySitesWithPluginsQuery,
	agencyWooPaymentsDataQuery,
	jetpackAgencyLicensesQuery,
} from '@automattic/api-queries';
import { useDesktopBreakpoint } from '@automattic/viewport-react';
import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { LayoutWithGuidedTour as Layout } from 'calypso/a8c-for-agencies/components/layout/layout-with-guided-tour';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/layout-with-payment-notification';
import { PageBodyPlaceholder } from 'calypso/a8c-for-agencies/components/page-placeholder';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import MissingPaymentSettingsNotice from 'calypso/a8c-for-agencies/sections/referrals/common/missing-payment-settings-notice';
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
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';
import AddWooPaymentsToSite from '../../add-woopayments-to-site';
import { WooPaymentsProvider } from '../../context';
import WooPaymentsDashboardContent from '../../dashboard-content';
import WooPaymentsDashboardEmptyState from './empty-state';
import { useTestConnections } from './use-test-connections';
import type { SitesWithWooPaymentsState } from '../../types';

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

	const agencyId = useSelector( getActiveAgencyId );

	const { data: licenseSites, isLoading: isLoadingLicensesWithWooPayments } = useQuery( {
		...jetpackAgencyLicensesQuery( agencyId ?? 0, {
			filter: LicenseFilter.Attached,
			search: 'woopayments',
			sortField: LicenseSortField.IssuedAt,
			sortDirection: LicenseSortDirection.Descending,
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
			sitesWithPlugins?.map( ( site ) => {
				return {
					blogId: site.blog_id,
					siteUrl: site.url,
					state: site.state,
				};
			} ) || []
		);
	}, [ sitesWithPlugins ] );

	const allSitesWithWooPayments = useMemo( () => {
		return [ ...( licenseSites || [] ), ...sitesWithWooPaymentsPlugins ];
	}, [ licenseSites, sitesWithWooPaymentsPlugins ] );

	const testConnections = useTestConnections( allSitesWithWooPayments );

	const isLoading = isLoadingLicensesWithWooPayments || isLoadingSitesWithPlugins;
	const showEmptyState = ! isLoading && ! allSitesWithWooPayments.length;

	const { data: woopaymentsData, isLoading: isLoadingWooPaymentsData } = useQuery( {
		...agencyWooPaymentsDataQuery( agencyId ?? 0 ),
		enabled: !! agencyId && !! allSitesWithWooPayments.length,
	} );

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
