import { type Callback } from '@automattic/calypso-router';
import Layout from 'calypso/a8c-for-agencies/components/layout';
import LayoutBody from 'calypso/a8c-for-agencies/components/layout/body';
import LayoutHeader, {
	LayoutHeaderSubtitle as Subtitle,
	LayoutHeaderTitle as Title,
} from 'calypso/a8c-for-agencies/components/layout/header';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/top';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
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
