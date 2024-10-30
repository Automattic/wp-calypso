import { __ } from '@wordpress/i18n';
import { useSelector } from 'react-redux';
import NavigationHeader from 'calypso/components/navigation-header';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { PanelWithSidebar, Sidebar, SidebarItem } from '../components/panel-sidebar';
import MarketingTools from './tools';
import type { Context as PageJSContext } from '@automattic/calypso-router';

export function MarketingSidebar() {
	const slug = useSelector( getSelectedSiteSlug );

	return (
		<Sidebar>
			<SidebarItem href={ `/sites/marketing/tools/${ slug }` }>{ __( 'Tools' ) }</SidebarItem>
		</Sidebar>
	);
}

export function marketingTools( context: PageJSContext, next: () => void ) {
	context.primary = (
		<PanelWithSidebar>
			<MarketingSidebar />
			<div>
				<NavigationHeader
					title={ __( 'Marketing Tools' ) }
					subtitle={ __(
						'Explore tools to build your audience, market your site, and engage your visitors.'
					) }
				/>
				<MarketingTools />
			</div>
		</PanelWithSidebar>
	);
	next();
}
