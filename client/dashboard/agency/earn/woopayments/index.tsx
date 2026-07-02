import { activeAgencyQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { useAnalytics } from '../../../app/analytics';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import AddWooPaymentsToSiteModal from './add-to-site/modal';
import WooPaymentsDashboardContent from './dashboard-content';
import { useWooPaymentsDashboardData } from './use-woopayments-dashboard-data';

// Not wired into a TanStack Router route search schema (no other `earn/*` route defines
// one), so we read this the same way other standalone, non-route-owned components do
// (see `sites/site-launch-celebration-modal`): a direct `URLSearchParams` read in the
// `useState` initializer, so it only runs once on mount.
function getInitialAddOpen() {
	return new URLSearchParams( window.location.search ).get( 'add-woopayments-to-site' ) === 'true';
}

export default function WooPaymentsDashboard() {
	const { recordTracksEvent } = useAnalytics();
	const { data: agency } = useQuery( activeAgencyQuery() );
	const agencyId = agency?.id ?? 0;
	const data = useWooPaymentsDashboardData();
	const [ isAddOpen, setAddOpen ] = useState( getInitialAddOpen );

	const openAddToSite = () => {
		recordTracksEvent( 'calypso_a4a_woopayments_add_site_button_click' );
		setAddOpen( true );
	};

	return (
		<PageLayout
			header={
				<PageHeader
					title={ __( 'WooPayments' ) }
					actions={
						! data.isLoading ? (
							<Button variant="primary" onClick={ openAddToSite }>
								{ __( 'Add WooPayments to site' ) }
							</Button>
						) : undefined
					}
				/>
			}
		>
			<WooPaymentsDashboardContent
				data={ data }
				agencyId={ agencyId }
				recordTracksEvent={ recordTracksEvent }
				onAddWooPayments={ () => setAddOpen( true ) }
			/>
			{ isAddOpen && (
				<AddWooPaymentsToSiteModal
					onClose={ () => setAddOpen( false ) }
					recordTracksEvent={ recordTracksEvent }
				/>
			) }
		</PageLayout>
	);
}
