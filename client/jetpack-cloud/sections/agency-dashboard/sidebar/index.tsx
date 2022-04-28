import { useTranslate } from 'i18n-calypso';
import { useDispatch } from 'react-redux';
import JetpackIcons from 'calypso/components/jetpack/sidebar/menu-items/jetpack-icons';
import SiteSelector from 'calypso/components/site-selector';
import Sidebar from 'calypso/layout/sidebar';
import SidebarFooter from 'calypso/layout/sidebar/footer';
import SidebarItem from 'calypso/layout/sidebar/item';
import SidebarMenu from 'calypso/layout/sidebar/menu';
import SidebarRegion from 'calypso/layout/sidebar/region';
import CurrentSite from 'calypso/my-sites/current-site';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import 'calypso/components/jetpack/sidebar/style.scss';
import type { CalypsoDispatch } from 'calypso/state/types';
import type { FunctionComponent } from 'react';

interface Props {
	path: string;
}
const DashboardSidebar: FunctionComponent< Props > = ( { path } ) => {
	const translate = useTranslate();
	const reduxDispatch = useDispatch< CalypsoDispatch >();

	const onNavigate = ( menuItem: string ) => () => {
		reduxDispatch(
			recordTracksEvent( 'calypso_jetpack_sidebar_menu_click', {
				menu_item: menuItem,
			} )
		);
		window.scrollTo( 0, 0 );
	};

	return (
		<div>
			<SiteSelector showAddNewSite showAllSites allSitesPath={ path } siteBasePath="/backup" />
			<Sidebar className="sidebar__jetpack-cloud">
				<SidebarRegion>
					<CurrentSite />
					<SidebarMenu>
						<SidebarItem
							customIcon={ <JetpackIcons icon="dashboard" /> }
							label={ translate( 'Dashboard', {
								comment: 'Jetpack sidebar navigation item',
							} ) }
							link={ path }
							onNavigate={ onNavigate( 'Jetpack Cloud / Partner Portal' ) }
							selected={ path === path }
						/>
					</SidebarMenu>
				</SidebarRegion>
				<SidebarFooter>
					<SidebarMenu>
						<SidebarItem
							label={ translate( 'Get help', {
								comment: 'Jetpack Cloud sidebar navigation item',
							} ) }
							link="https://jetpack.com/support"
							className="sidebar__jetpack-cloud-item-has-border"
							customIcon={ <JetpackIcons icon="help" /> }
							onNavigate={ onNavigate( 'Jetpack Cloud / Support' ) }
						/>
					</SidebarMenu>
				</SidebarFooter>
			</Sidebar>
		</div>
	);
};

export default DashboardSidebar;
