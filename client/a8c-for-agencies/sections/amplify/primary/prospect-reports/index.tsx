import { queryClient } from '@automattic/api-queries';
import { QueryClientProvider } from '@tanstack/react-query';
import { LayoutWithGuidedTour as Layout } from 'calypso/a8c-for-agencies/components/layout/layout-with-guided-tour';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/layout-with-payment-notification';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import { A4A_AGENCY_TIER_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import { getFeatureName } from 'calypso/dashboard/agency/amplify/constants';
import AmplifyContent from 'calypso/dashboard/agency/amplify/content';
import AmplifyHeaderActions from 'calypso/dashboard/agency/amplify/header-actions';
import { AmplifyApprovalNotice } from 'calypso/dashboard/agency/amplify/usage-meter';
import { useAmplifyPage } from 'calypso/dashboard/agency/amplify/use-amplify-page';
import { AnalyticsProvider } from 'calypso/dashboard/app/analytics';
import { AuthProvider } from 'calypso/dashboard/app/auth';
import LayoutBody from 'calypso/layout/hosting-dashboard/body';
import LayoutHeader, {
	LayoutHeaderTitle as Title,
	LayoutHeaderActions as Actions,
} from 'calypso/layout/hosting-dashboard/header';
import { useAnalyticsClient } from 'calypso/sites/v2/hooks/use-analytics-client';

const TIERS_LINK = { tiersPath: A4A_AGENCY_TIER_LINK };

function ProspectReportsLayout() {
	const title = getFeatureName();
	const page = useAmplifyPage();

	return (
		<Layout title={ title } wide>
			<LayoutTop>
				{ ( page.usageStatus === 'pending' || page.usageStatus === 'rejected' ) && (
					<AmplifyApprovalNotice agencyId={ page.agencyId } status={ page.usageStatus } />
				) }
				<LayoutHeader>
					<Title>{ title }</Title>
					<Actions>
						<MobileSidebarNavigation />
						<AmplifyHeaderActions page={ page } tiersLink={ TIERS_LINK } />
					</Actions>
				</LayoutHeader>
			</LayoutTop>
			<LayoutBody>
				<AmplifyContent page={ page } tiersLink={ TIERS_LINK } />
			</LayoutBody>
		</Layout>
	);
}

/**
 * The Multi-site Dashboard's Prospect reports page, with the query client, auth and
 * analytics it reads from there.
 */
export default function ProspectReports() {
	const analyticsClient = useAnalyticsClient( undefined, window.location.pathname );

	return (
		<QueryClientProvider client={ queryClient }>
			<AuthProvider>
				<AnalyticsProvider client={ analyticsClient }>
					<ProspectReportsLayout />
				</AnalyticsProvider>
			</AuthProvider>
		</QueryClientProvider>
	);
}
