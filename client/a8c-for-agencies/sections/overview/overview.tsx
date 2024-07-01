import { useTranslate } from 'i18n-calypso';
import ContentSidebar from 'calypso/a8c-for-agencies/components/content-sidebar';
import Layout from 'calypso/a8c-for-agencies/components/layout';
import LayoutBody from 'calypso/a8c-for-agencies/components/layout/body';
import LayoutHeader, {
	LayoutHeaderActions as Actions,
	LayoutHeaderTitle as Title,
} from 'calypso/a8c-for-agencies/components/layout/header';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/top';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import OverviewBody from './body';
import OverviewHeaderActions from './header-actions';
import PartnerDirectoryOnboardingCard from './partner-directory-onboarding-card';
import OverviewSidebar from './sidebar';

import './style.scss';

export default function Overview() {
	const translate = useTranslate();
	const title = translate( 'Agency Overview' );

	return (
		<Layout title={ title } wide>
			<LayoutTop>
				<LayoutHeader className="a4a-overview-header">
					<Title>{ title }</Title>
					<Actions className="a4a-overview__header-actions">
						<MobileSidebarNavigation />
						<OverviewHeaderActions />
					</Actions>
				</LayoutHeader>
			</LayoutTop>
			<LayoutBody className="a4a-overview-content">
				<ContentSidebar mainContent={ <OverviewBody /> } rightSidebar={ <OverviewSidebar /> } />
			</LayoutBody>

			<PartnerDirectoryOnboardingCard />
		</Layout>
	);
}
