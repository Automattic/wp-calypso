import { type Callback } from '@automattic/calypso-router';
import { LayoutWithGuidedTour as Layout } from 'calypso/a8c-for-agencies/components/layout/layout-with-guided-tour';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/layout-with-payment-notification';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import LayoutBody from 'calypso/layout/multi-sites-dashboard/body';
import LayoutHeader, {
	LayoutHeaderSubtitle as Subtitle,
	LayoutHeaderTitle as Title,
} from 'calypso/layout/multi-sites-dashboard/header';
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
