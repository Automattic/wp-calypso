import { useDesktopBreakpoint } from '@automattic/viewport-react';
import { Spinner } from '@wordpress/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { LayoutWithGuidedTour as Layout } from 'calypso/a8c-for-agencies/components/layout/layout-with-guided-tour';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/layout-with-payment-notification';
import { PageBodyPlaceholder } from 'calypso/a8c-for-agencies/components/page-placeholder';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import useFetchAllLicenses from 'calypso/a8c-for-agencies/data/purchases/use-fetch-all-licenses';
import useFetchSitesWithPlugins from 'calypso/a8c-for-agencies/data/sites/use-fetch-sites-with-plugins';
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
import MissingPaymentSettingsNotice from '../../missing-payment-settings-notice';
import WooPaymentsDashboardEmptyState from './empty-state';
import type { Site } from '../../../sites/types';
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

	const isDesktop = useDesktopBreakpoint();

	const title = translate( 'WooPayments commissions' );

	const [ sitesWithPluginsStates, setSitesWithPluginsStates ] = useState<
		SitesWithWooPaymentsState[]
	>( [] );

	const [ isWooPaymentsDataLoading, setIsWooPaymentsDataLoading ] = useState( false );

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

	const testConnections = useFetchTestConnections(
		true,
		licensesWithWooPayments?.items.map( ( license: License ) => {
			return {
				blog_id: license.blogId,
				is_connection_healthy: true,
			} as Site;
		} ) || []
	);

	const isLoading = isLoadingLicensesWithWooPayments || isLoadingSitesWithPlugins;
	const showEmptyState = ! isLoading && ! sitesWithPluginsStates.length;

	const { data: woopaymentsData, isLoading: isLoadingWooPaymentsData } = useFetchWooPaymentsData(
		isWooPaymentsDataLoading,
		!! sitesWithPluginsStates.length
	);

	const isInProgress =
		woopaymentsData?.status === 'in_progress' && !! sitesWithPluginsStates.length;

	useEffect( () => {
		if ( isInProgress ) {
			setIsWooPaymentsDataLoading( true );
		} else {
			setIsWooPaymentsDataLoading( false );
		}
	}, [ isInProgress, sitesWithPluginsStates ] );

	const createInitialSiteState = useCallback(
		( license: License ) => {
			const sitePlugin = sitesWithPlugins?.find(
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
		if ( ! licensesWithWooPayments?.items ) {
			return;
		}

		const states = licensesWithWooPayments.items.map( createInitialSiteState );

		setSitesWithPluginsStates( states );
	}, [ sitesWithPlugins, licensesWithWooPayments, createInitialSiteState ] );

	const sitesWithPluginsStatesSorted = useMemo( () => {
		return sitesWithPluginsStates
			.map( ( site ) => {
				const connection = testConnections?.find( ( connection ) => connection.ID === site.blogId );
				return {
					...site,
					state: connection?.connected === false ? 'disconnected' : site.state,
				};
			} )
			.sort( sortByState );
	}, [ sitesWithPluginsStates, testConnections ] );

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
					sitesWithPluginsStates: sitesWithPluginsStatesSorted,
				} }
			>
				<LayoutTop isFullWidth={ isFullWidth }>
					{ !! sitesWithPluginsStates.length && <MissingPaymentSettingsNotice /> }
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
