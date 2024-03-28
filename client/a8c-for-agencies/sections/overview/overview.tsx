import { useBreakpoint } from '@automattic/viewport-react';
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
import OverviewSidebar from './sidebar';
import './style.scss';

export default function Overview() {
	const translate = useTranslate();
	const title = translate( 'Agency HQ Overview' );
	const isNarrowView = useBreakpoint( '<660px' );

	return (
		<Layout title={ title } wide>
			<LayoutTop>
				{ ! isNarrowView ? (
					<LayoutHeader className="a4a-overview-header">
						<Title>{ title }</Title>
						<Actions>
							<OverviewHeaderActions />
						</Actions>
					</LayoutHeader>
				) : (
					<Actions className="a4a-layout-header-mobile">
						<MobileSidebarNavigation />
						<OverviewHeaderActions />
					</Actions>
				) }
			</LayoutTop>
			<LayoutBody className="a4a-overview-content">
				<ContentSidebar mainContent={ <OverviewBody /> } rightSidebar={ <OverviewSidebar /> } />
			</LayoutBody>
		</Layout>
	);
}
