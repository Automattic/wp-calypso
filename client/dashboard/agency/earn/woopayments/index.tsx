import { activeAgencyQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { __experimentalVStack as VStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useMemo } from 'react';
import { useAnalytics } from '../../../app/analytics';
import { DataViewsCard } from '../../../components/dataviews';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import MissingPaymentSettingsNotice from '../missing-payment-settings-notice';
import AddWooPaymentsToSite from './add-woopayments-to-site';
import CommissionsTable from './commissions-table';
import ConsolidatedViews from './consolidated-views';
import WooPaymentsDashboardEmptyState from './empty-state';
import { useDownloadCommissionsReport } from './use-download-commissions-report';
import useWooPaymentsDashboardData from './use-woopayments-dashboard-data';

export default function EarnWooPayments() {
	const { data: agency } = useQuery( activeAgencyQuery() );
	const agencyId = agency?.id ?? 0;

	const {
		isLoading,
		showEmptyState,
		hasSites,
		woopaymentsData,
		isLoadingWooPaymentsData,
		sitesWithPluginsStates,
	} = useWooPaymentsDashboardData( agencyId );
	const { recordTracksEvent } = useAnalytics();
	const { downloadCommissionsReport } = useDownloadCommissionsReport( agencyId );

	const excludedSiteIds = useMemo(
		() => sitesWithPluginsStates.map( ( site ) => site.blogId ),
		[ sitesWithPluginsStates ]
	);

	const header = (
		<PageHeader
			title={ __( 'WooPayments commissions' ) }
			description={ __( 'Earn revenue share from WooPayments on your clients’ stores.' ) }
			actions={
				hasSites ? (
					<AddWooPaymentsToSite
						agencyId={ agencyId }
						excludedSiteIds={ excludedSiteIds }
						recordTracksEvent={ recordTracksEvent }
						navigate={ ( url ) => {
							window.location.href = url;
						} }
					/>
				) : undefined
			}
		/>
	);

	if ( isLoading ) {
		return <PageLayout header={ header } />;
	}

	return (
		<PageLayout
			header={ header }
			notices={ <MissingPaymentSettingsNotice hasCommissionActivity={ hasSites } /> }
		>
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
