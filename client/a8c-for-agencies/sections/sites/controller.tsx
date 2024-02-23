import { type Callback } from '@automattic/calypso-router';
import Layout from 'calypso/a8c-for-agencies/components/layout';
import LayoutBody from 'calypso/a8c-for-agencies/components/layout/body';
import LayoutHeader, {
	LayoutHeaderTitle as Title,
} from 'calypso/a8c-for-agencies/components/layout/header';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/top';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import SitesSidebar from '../../components/sidebar-menu/sites';

export const sitesContext: Callback = ( context, next ) => {
	context.secondary = <SitesSidebar path={ context.path } />;
	context.primary = (
		<Layout title="Overview" wide sidebarNavigation={ <MobileSidebarNavigation /> }>
			<LayoutTop>
				<LayoutHeader>
					<Title>sites</Title>
				</LayoutHeader>
			</LayoutTop>
			<LayoutBody>
				<div>test</div>
			</LayoutBody>
		</Layout>
	);

	next();
};

export const sitesFavoriteContext: Callback = ( context, next ) => {
	context.secondary = <SitesSidebar path={ context.path } />;
	context.primary = (
		<Layout title="Overview" wide sidebarNavigation={ <MobileSidebarNavigation /> }>
			<LayoutTop>
				<LayoutHeader>
					<Title>sites favorite</Title>
				</LayoutHeader>
			</LayoutTop>
			<LayoutBody>
				<div>test</div>
			</LayoutBody>
		</Layout>
	);

	next();
};
