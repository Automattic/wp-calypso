import { __experimentalText as Text } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import useWooPaymentsDashboardData from './use-woopayments-dashboard-data';

export default function EarnWooPayments() {
	const { isLoading, showEmptyState } = useWooPaymentsDashboardData();

	const header = (
		<PageHeader
			title={ __( 'WooPayments commissions' ) }
			description={ __( 'Earn revenue share from WooPayments on your clients’ stores.' ) }
		/>
	);

	if ( isLoading ) {
		return <PageLayout header={ header } />;
	}

	return (
		<PageLayout header={ header }>
			{ showEmptyState ? (
				<Text>{ __( 'Add WooPayments to a client site to start earning commissions.' ) }</Text>
			) : (
				<Text>{ __( 'Commissions overview and per-site breakdown coming next.' ) }</Text>
			) }
		</PageLayout>
	);
}
