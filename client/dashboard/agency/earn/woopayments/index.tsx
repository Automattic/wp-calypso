import { activeAgencyQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { __experimentalVStack as VStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useCallback, useMemo, useState } from 'react';
import { useAnalytics } from '../../../app/analytics';
import { useConsumeSearchParams } from '../../../app/hooks/use-consume-search-params';
import { useLocale } from '../../../app/locale';
import { earnWooPaymentsSetupRoute } from '../../../app/router/agency';
import { DataViewsCard } from '../../../components/dataviews';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import { useIsApprovalGated } from '../../approval-gate';
import { AgencyNotices } from '../../components/agency-notices';
import MissingPaymentSettingsNotice, {
	useMissingPaymentSettings,
} from '../missing-payment-settings-notice';
import AddWooPaymentsToSite from './add-woopayments-to-site';
import CommissionsTable from './commissions-table';
import ConsolidatedViews from './consolidated-views';
import WooPaymentsDashboardEmptyState from './empty-state';
import { useDownloadCommissionsReport } from './use-download-commissions-report';
import useWooPaymentsDashboardData from './use-woopayments-dashboard-data';

const ADD_TO_SITE_PARAMS = [ 'add-woopayments-to-site' ] as const;

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
	const missingPaymentSettings = useMissingPaymentSettings( {
		hasCommissionActivity: hasSites,
		isLoadingActivity: isLoading,
	} );
	const { recordTracksEvent } = useAnalytics();
	const locale = useLocale();
	const { downloadCommissionsReport } = useDownloadCommissionsReport( agencyId );
	const router = useRouter();
	const isApprovalGated = useIsApprovalGated();
	const [ isAddSiteRequested, setIsAddSiteRequested ] = useState( false );
	useConsumeSearchParams( ADD_TO_SITE_PARAMS, {
		when: ( params ) => params[ 'add-woopayments-to-site' ] === 'true',
		onConsume: () => setIsAddSiteRequested( true ),
	} );
	const handleAddSiteAutoOpen = useCallback( () => setIsAddSiteRequested( false ), [] );

	const navigateToSiteSetup = useCallback(
		( siteId: number ) =>
			router.navigate( {
				to: earnWooPaymentsSetupRoute.fullPath,
				params: { siteId: String( siteId ) },
			} ),
		[ router ]
	);

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
						onSelectSite={ navigateToSiteSetup }
						shouldUseRouterLink
						isApprovalGated={ isApprovalGated }
						autoOpen={ isAddSiteRequested }
						onAutoOpen={ handleAddSiteAutoOpen }
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
			notices={
				<AgencyNotices
					candidates={ [
						{
							id: 'missing-payment-settings',
							...missingPaymentSettings,
							notice: (
								<MissingPaymentSettingsNotice
									hasCommissionActivity={ hasSites }
									commissionType="woopayments"
								/>
							),
						},
					] }
				/>
			}
		>
			{ showEmptyState ? (
				<WooPaymentsDashboardEmptyState
					autoOpenAddSite={ isAddSiteRequested }
					onAddSiteAutoOpen={ handleAddSiteAutoOpen }
				/>
			) : (
				<VStack spacing={ 6 }>
					<ConsolidatedViews
						woopaymentsData={ woopaymentsData }
						isLoading={ isLoadingWooPaymentsData }
						locale={ locale }
					/>
					<DataViewsCard>
						<CommissionsTable
							sites={ sitesWithPluginsStates }
							woopaymentsData={ woopaymentsData }
							isLoadingWooPaymentsData={ isLoadingWooPaymentsData }
							recordTracksEvent={ recordTracksEvent }
							onDownloadReport={ downloadCommissionsReport }
							onContinueSetup={ navigateToSiteSetup }
						/>
					</DataViewsCard>
				</VStack>
			) }
		</PageLayout>
	);
}
