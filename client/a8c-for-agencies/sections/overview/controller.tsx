import { type Callback } from '@automattic/calypso-router';
import Layout from 'calypso/a8c-for-agencies/components/layout';
import LayoutBody from 'calypso/a8c-for-agencies/components/layout/body';
import LayoutHeader, {
	LayoutHeaderSubtitle as Subtitle,
	LayoutHeaderTitle as Title,
} from 'calypso/a8c-for-agencies/components/layout/header';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/top';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import ContentSidebar from '../../components/content-sidebar';
import MainSidebar from '../../components/sidebar-menu/main';
import OverviewBody from './body';
import OverviewSidebar from './sidebar';

export const overviewContext: Callback = ( context, next ) => {
	context.secondary = <MainSidebar path={ context.path } />;
	context.primary = (
		<Layout title="Overview" wide sidebarNavigation={ <MobileSidebarNavigation /> }>
			<LayoutTop>
				<LayoutHeader>
					<Title>Overview</Title>
					<Subtitle>Overview of your agency</Subtitle>
				</LayoutHeader>
			</LayoutTop>
			<LayoutBody>
				<ContentSidebar mainContent={ <OverviewBody /> } rightSidebar={ <OverviewSidebar /> } />
			</LayoutBody>
		</Layout>
	);

	next();
};
