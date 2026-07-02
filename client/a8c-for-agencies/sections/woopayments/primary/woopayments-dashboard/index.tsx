import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { LayoutWithGuidedTour as Layout } from 'calypso/a8c-for-agencies/components/layout/layout-with-guided-tour';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/layout-with-payment-notification';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import MissingPaymentSettingsNotice from 'calypso/a8c-for-agencies/sections/referrals/common/missing-payment-settings-notice';
import AddWooPaymentsToSiteModal from 'calypso/dashboard/agency/earn/woopayments/add-to-site/modal';
import WooPaymentsDashboardContent from 'calypso/dashboard/agency/earn/woopayments/dashboard-content';
import { useWooPaymentsDashboardData } from 'calypso/dashboard/agency/earn/woopayments/use-woopayments-dashboard-data';
import LayoutBody from 'calypso/layout/hosting-dashboard/body';
import LayoutHeader, {
	LayoutHeaderTitle as Title,
	LayoutHeaderActions as Actions,
} from 'calypso/layout/hosting-dashboard/header';
import { useDispatch, useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

import './style.scss';

// The `woopayments-overview` page links here with `?add-woopayments-to-site=true` to
// auto-open the modal after redirecting (see `../woopayments-overview`). Mirrors the
// dashboard client's `getInitialAddOpen` so this cross-page flow keeps working; only
// runs once on mount, hence the `useState` initializer rather than an effect.
function getInitialAddOpen() {
	return new URLSearchParams( window.location.search ).get( 'add-woopayments-to-site' ) === 'true';
}

const WooPaymentsDashboard = () => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const title = translate( 'WooPayments commissions' );

	const agencyId = useSelector( getActiveAgencyId ) ?? 0;
	const data = useWooPaymentsDashboardData();
	const [ isAddOpen, setAddOpen ] = useState( getInitialAddOpen );

	const recordEvent = ( name: string, props?: Record< string, unknown > ) =>
		dispatch( recordTracksEvent( name, props ) );

	const openAddToSite = () => {
		recordEvent( 'calypso_a4a_woopayments_add_site_button_click' );
		setAddOpen( true );
	};

	return (
		<Layout className="woopayments-dashboard" title={ title } wide>
			<LayoutTop>
				{ data.hasSites && <MissingPaymentSettingsNotice commissionType="woopayments" /> }
				<LayoutHeader>
					<Title>{ title }</Title>
					<Actions>
						<MobileSidebarNavigation />
						{ ! data.isLoading && (
							<Button variant="primary" onClick={ openAddToSite }>
								{ translate( 'Add WooPayments to site' ) }
							</Button>
						) }
					</Actions>
				</LayoutHeader>
			</LayoutTop>

			<LayoutBody>
				<WooPaymentsDashboardContent
					data={ data }
					agencyId={ agencyId }
					recordTracksEvent={ recordEvent }
					onAddWooPayments={ () => setAddOpen( true ) }
				/>
			</LayoutBody>

			{ isAddOpen && (
				<AddWooPaymentsToSiteModal
					onClose={ () => setAddOpen( false ) }
					recordTracksEvent={ recordEvent }
				/>
			) }
		</Layout>
	);
};

export default WooPaymentsDashboard;
