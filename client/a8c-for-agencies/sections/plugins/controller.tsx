import { type Callback } from '@automattic/calypso-router';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import Layout from 'calypso/components/multi-site-dashboard/layout';
import LayoutBody from 'calypso/components/multi-site-dashboard/layout/body';
import LayoutHeader, {
	LayoutHeaderSubtitle as Subtitle,
	LayoutHeaderTitle as Title,
} from 'calypso/components/multi-site-dashboard/layout/header';
import LayoutTop from 'calypso/components/multi-site-dashboard/layout/top';
import MainSidebar from '../../components/sidebar-menu/main';

export const pluginsContext: Callback = ( context, next ) => {
	context.secondary = <MainSidebar path={ context.path } />;
	context.primary = (
		<Layout title="Plugins" wide sidebarNavigation={ <MobileSidebarNavigation /> }>
			<LayoutTop>
				<LayoutHeader>
					<Title>Plugins</Title>
					<Subtitle>plugins of your agency</Subtitle>
				</LayoutHeader>
			</LayoutTop>
			<LayoutBody>
				<div>test</div>
			</LayoutBody>
		</Layout>
	);

	next();
};
