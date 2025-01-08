import { Button } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { store as noticesStore } from '@wordpress/notices';
import { useTranslate } from 'i18n-calypso';
import A4AAgencyApprovalNotice from 'calypso/a8c-for-agencies/components/a4a-agency-approval-notice';
import ContentSidebar from 'calypso/a8c-for-agencies/components/content-sidebar';
import { LayoutWithGuidedTour as Layout } from 'calypso/a8c-for-agencies/components/layout/layout-with-guided-tour';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/layout-with-payment-notification';
import PressableUsageLimitNotice from 'calypso/a8c-for-agencies/components/pressable-usage-limit-notice';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import LayoutBody from 'calypso/layout/hosting-dashboard/body';
import LayoutHeader, {
	LayoutHeaderActions as Actions,
	LayoutHeaderTitle as Title,
} from 'calypso/layout/hosting-dashboard/header';
import OverviewBody from './body';
import OverviewHeaderActions from './header-actions';
import PartnerDirectoryOnboardingCard from './partner-directory-onboarding-card';
import OverviewSidebar from './sidebar';

import './style.scss';

export default function Overview() {
	const translate = useTranslate();
	const title = translate( 'Agency Overview' );

	const { createSuccessNotice, createErrorNotice, createInfoNotice, createWarningNotice } =
		useDispatch( noticesStore );

	const onClick = () => {
		createSuccessNotice( 'This is a notice that will timeout' );
		createSuccessNotice( translate( 'This is a notice with link that will not timeout' ), {
			explicitDismiss: true,
			actions: [
				{
					label: 'Action',
					url: null,
					onClick: null,
				},
			],
		} );
		createErrorNotice( 'This is a notice that will timeout' );
		createInfoNotice( 'This is a notice that will timeout' );
		createWarningNotice( 'This is a notice that will timeout' );
	};

	return (
		<Layout title={ title } wide>
			<LayoutTop>
				<A4AAgencyApprovalNotice />
				<PressableUsageLimitNotice />
				<LayoutHeader className="a4a-overview-header">
					<Title>{ title }</Title>
					<Actions className="a4a-overview__header-actions">
						<MobileSidebarNavigation />
						<OverviewHeaderActions />
					</Actions>
				</LayoutHeader>
			</LayoutTop>
			<LayoutBody className="a4a-overview-content">
				<Button onClick={ onClick }>Hello</Button>
				<ContentSidebar mainContent={ <OverviewBody /> } rightSidebar={ <OverviewSidebar /> } />
			</LayoutBody>

			<PartnerDirectoryOnboardingCard />
		</Layout>
	);
}
