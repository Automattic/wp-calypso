import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import JetpackIcons from 'calypso/components/jetpack/sidebar/menu-items/jetpack-icons';
import SiteSelector from 'calypso/components/site-selector';
import SidebarItem from 'calypso/layout/sidebar/item';
import Sidebar from 'calypso/layout/sidebar-v2';
import SidebarFooter from 'calypso/layout/sidebar-v2/footer';
import SidebarMain from 'calypso/layout/sidebar-v2/main';
import { useSelector } from 'calypso/state';
import getJetpackAdminUrl from 'calypso/state/sites/selectors/get-jetpack-admin-url';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import SidebarHeader from './header';

import './style.scss';

// This is meant to be the "base" sidebar component. All context-specific sidebars
// (Sites Management, Plugin Management, Purchases, non-Manage functionality)
// would use it to construct the right experience for that context.

type Props = {
	className?: string;
	isJetpackManage?: boolean;
};
const JetpackCloudSidebar = ( { className, isJetpackManage }: Props ) => {
	const siteId = useSelector( ( state ) => getSelectedSiteId( state ) );
	const jetpackAdminUrl = useSelector( ( state ) =>
		siteId ? getJetpackAdminUrl( state, siteId ) : null
	);

	const translate = useTranslate();

	return (
		<Sidebar className={ classNames( 'jetpack-cloud-sidebar', className ) }>
			<SidebarHeader forceAllSitesView={ isJetpackManage } />

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

			{ ! isJetpackManage && (
				<SidebarFooter>
					<SidebarItem
						label={ translate( 'WP Admin', {
							comment: 'Jetpack Cloud sidebar navigation item',
						} ) }
						link={ jetpackAdminUrl }
						customIcon={ <JetpackIcons icon="wordpress" /> }
					/>
				</SidebarFooter>
			) }

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
};

export default JetpackCloudSidebar;
