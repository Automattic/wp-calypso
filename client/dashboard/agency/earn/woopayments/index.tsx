import { __experimentalVStack as VStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useAnalytics } from '../../../app/analytics';
import { DataViewsCard } from '../../../components/dataviews';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import CommissionsTable from './commissions-table';
import ConsolidatedViews from './consolidated-views';
import WooPaymentsDashboardEmptyState from './empty-state';
import { useDownloadCommissionsReport } from './use-download-commissions-report';
import useWooPaymentsDashboardData from './use-woopayments-dashboard-data';

export default function EarnWooPayments() {
	const {
		isLoading,
		showEmptyState,
		woopaymentsData,
		isLoadingWooPaymentsData,
		sitesWithPluginsStates,
	} = useWooPaymentsDashboardData();
	const { recordTracksEvent } = useAnalytics();
	const { downloadCommissionsReport } = useDownloadCommissionsReport();

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
				<WooPaymentsDashboardEmptyState />
			) : (
				<VStack spacing={ 6 }>
					<ConsolidatedViews
						woopaymentsData={ woopaymentsData }
						isLoading={ isLoadingWooPaymentsData }
					/>
					<DataViewsCard>
						<CommissionsTable
							sites={ sitesWithPluginsStates }
							woopaymentsData={ woopaymentsData }
							isLoadingWooPaymentsData={ isLoadingWooPaymentsData }
							recordTracksEvent={ recordTracksEvent }
							onDownloadReport={ downloadCommissionsReport }
						/>
					</DataViewsCard>
				</VStack>
			) }
		</PageLayout>
	);
}
