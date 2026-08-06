import { isEnabled } from '@automattic/calypso-config';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import A4AAgencyApprovalNotice from 'calypso/a8c-for-agencies/components/a4a-agency-approval-notice';
import ContentSidebar from 'calypso/a8c-for-agencies/components/content-sidebar';
import { LayoutWithGuidedTour as Layout } from 'calypso/a8c-for-agencies/components/layout/layout-with-guided-tour';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/layout-with-payment-notification';
import PaymentRiskNoticeBanner from 'calypso/a8c-for-agencies/components/payment-risk-notice-banner';
import PressableUsageLimitNotice from 'calypso/a8c-for-agencies/components/pressable-usage-limit-notice';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import { AgencyOverviewHeaderInfo } from 'calypso/dashboard/agency/overview/overview-header';
import LayoutBody from 'calypso/layout/hosting-dashboard/body';
import LayoutHeader, {
	LayoutHeaderActions as Actions,
	LayoutHeaderSubtitle as Subtitle,
	LayoutHeaderTitle as Title,
} from 'calypso/layout/hosting-dashboard/header';
import { useSelector } from 'calypso/state';
import { getActiveAgency } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { ApprovalStatus } from 'calypso/state/a8c-for-agencies/types';
import { getCurrentUserLocale } from 'calypso/state/current-user/selectors';
import { MissingPaymentSettingsNotice } from '../referrals/common/missing-payment-settings-notice';
import useHasCommissionActivity from '../referrals/common/missing-payment-settings-notice/use-has-commission-activity';
import OverviewBody from './body';
import DashboardOverviewBody from './dashboard-overview-body';
import OverviewHeaderActions from './header-actions';
import PartnerDirectoryOnboardingCard from './partner-directory-onboarding-card';
import OverviewSidebar from './sidebar';

import './style.scss';

export default function Overview() {
	const translate = useTranslate();
	const title = translate( 'Agency overview' );
	const isRevamp = isEnabled( 'a4a-overview-revamp' );
	const agency = useSelector( getActiveAgency );
	const locale = useSelector( getCurrentUserLocale );
	const showAgencyHeader = isRevamp && !! agency;
	// The revamped overview renders pending and rejected applications as tier-card
	// states, so the approval banner is redundant here; the approved welcome
	// banner has no card equivalent and stays. Other pages keep the banner.
	const showApprovalNotice = ! isRevamp || agency?.approval_status === ApprovalStatus.APPROVED;

	const { hasActivity, isLoading: isLoadingActivity } = useHasCommissionActivity();

	return (
		<Layout title={ title } wide>
			<LayoutTop>
				{ ! isLoadingActivity && hasActivity && <MissingPaymentSettingsNotice /> }
				{ showApprovalNotice && <A4AAgencyApprovalNotice /> }
				<PressableUsageLimitNotice />
				<PaymentRiskNoticeBanner source="overview" />

				<LayoutHeader className="a4a-overview-header">
					<Title>{ showAgencyHeader ? agency?.name : title }</Title>
					{ showAgencyHeader && (
						<Subtitle>
							<AgencyOverviewHeaderInfo
								url={ agency?.url }
								createdAt={ agency?.created_at }
								locale={ locale }
							/>
						</Subtitle>
					) }
					<Actions className="a4a-overview__header-actions">
						<MobileSidebarNavigation />
						{ ! isRevamp && <OverviewHeaderActions /> }
					</Actions>
				</LayoutHeader>
			</LayoutTop>
			<LayoutBody className={ clsx( 'a4a-overview-content', { 'is-revamp': isRevamp } ) }>
				{ isRevamp ? (
					<DashboardOverviewBody />
				) : (
					<ContentSidebar mainContent={ <OverviewBody /> } rightSidebar={ <OverviewSidebar /> } />
				) }
			</LayoutBody>

			<PartnerDirectoryOnboardingCard />
		</Layout>
	);
}
