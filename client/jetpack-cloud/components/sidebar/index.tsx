import classNames from 'classnames';
import SiteSelector from 'calypso/components/site-selector';
import Sidebar from 'calypso/layout/sidebar-v2';
import SidebarFooter from 'calypso/layout/sidebar-v2/footer';
import SidebarMain from 'calypso/layout/sidebar-v2/main';
import Header from './header';

import './style.scss';

// This is meant to be the "base" sidebar component. All context-specific sidebars
// (Sites Management, Plugin Management, Purchases, non-Manage functionality)
// would use it to construct the right experience for that context.

type Props = {
	className?: string;
	isJetpackManage?: boolean;
};
const JetpackCloudSidebar = ( { className, isJetpackManage = false }: Props ) => (
	<Sidebar className={ classNames( 'jetpack-cloud-sidebar', className ) }>
		<Header forceAllSitesView={ isJetpackManage } />

		<SidebarMain>
			<ul role="menu" className="jetpack-cloud-sidebar__navigation-list">
				<li
					className={ classNames(
						'jetpack-cloud-sidebar__navigation-item',
						'jetpack-cloud-sidebar__navigation-item--highlighted'
					) }
				>
					Navigation items
				</li>
				<li className="jetpack-cloud-sidebar__navigation-item">Will go here</li>
			</ul>
		</SidebarMain>

		<SidebarFooter>Footer v2</SidebarFooter>

		<SiteSelector
			showAddNewSite
			showAllSites={ isJetpackManage }
			isJetpackAgencyDashboard={ isJetpackManage }
			className="jetpack-cloud-sidebar__site-selector"
			allSitesPath="/dashboard"
			siteBasePath="/landing"
			wpcomSiteBasePath="https://wordpress.com/home"
		/>
	</Sidebar>
);

export default JetpackCloudSidebar;
