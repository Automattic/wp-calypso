import { useDesktopBreakpoint } from '@automattic/viewport-react';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import { useMemo } from 'react';
import { LayoutWithGuidedTour as Layout } from 'calypso/a8c-for-agencies/components/layout/layout-with-guided-tour';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/layout-with-payment-notification';
import { PageBodyPlaceholder } from 'calypso/a8c-for-agencies/components/page-placeholder';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import MissingPaymentSettingsNotice from 'calypso/a8c-for-agencies/sections/referrals/common/missing-payment-settings-notice';
import LayoutBody from 'calypso/layout/hosting-dashboard/body';
import LayoutHeader, {
	LayoutHeaderTitle as Title,
	LayoutHeaderActions as Actions,
} from 'calypso/layout/hosting-dashboard/header';
import AddWooPaymentsToSite from '../../add-woopayments-to-site';
import { WooPaymentsProvider } from '../../context';
import WooPaymentsDashboardContent from '../../dashboard-content';
import useWooPaymentsDashboardData from '../../hooks/use-woopayments-dashboard-data';
import WooPaymentsDashboardEmptyState from './empty-state';

import './style.scss';

const WooPaymentsDashboard = () => {
	const isDesktop = useDesktopBreakpoint();

	const title = __( 'WooPayments commissions' );

	const {
		isLoading,
		showEmptyState,
		hasSites,
		woopaymentsData,
		isLoadingWooPaymentsData,
		sitesWithPluginsStates,
	} = useWooPaymentsDashboardData();

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
					sitesWithPluginsStates,
				} }
			>
				<LayoutTop isFullWidth={ isFullWidth }>
					{ hasSites && <MissingPaymentSettingsNotice commissionType="woopayments" /> }
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
