import config from '@automattic/calypso-config';
import { Icon, plugins } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import JetpackIcons from 'calypso/components/jetpack/sidebar/menu-items/jetpack-icons';
import SiteSelector from 'calypso/components/site-selector';
import Sidebar from 'calypso/layout/sidebar';
import SidebarFooter from 'calypso/layout/sidebar/footer';
import SidebarItem from 'calypso/layout/sidebar/item';
import SidebarMenu from 'calypso/layout/sidebar/menu';
import SidebarRegion from 'calypso/layout/sidebar/region';
import CurrentSite from 'calypso/my-sites/current-site';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import type { FunctionComponent } from 'react';

import 'calypso/components/jetpack/sidebar/style.scss';
import './style.scss';

interface Props {
	path: string;
}
const DashboardSidebar: FunctionComponent< Props > = ( { path } ) => {
	const translate = useTranslate();
	const reduxDispatch = useDispatch();

	const onNavigate = ( menuItem: string ) => () => {
		reduxDispatch(
			recordTracksEvent( 'calypso_jetpack_sidebar_menu_click', {
				menu_item: menuItem,
			} )
		);
		window.scrollTo( 0, 0 );
	};

	const isPluginsPage = path.includes( '/plugins' );
	const isPluginManagementEnabled = config.isEnabled( 'jetpack/plugin-management' );

	const isAtomicSiteCreationEnabled = config.isEnabled(
		'jetpack/pro-dashboard-wpcom-atomic-hosting'
	);

	return (
		<div>
			<SiteSelector
				showAddNewSite
				showAllSites
				isJetpackAgencyDashboard={ isAtomicSiteCreationEnabled }
				className="sidebar__site-selector"
				allSitesPath={ path }
				siteBasePath="/backup"
				wpcomSiteBasePath={ isAtomicSiteCreationEnabled && 'https://wordpress.com/home' }
			/>
			<Sidebar className="sidebar__jetpack-cloud">
				<SidebarRegion>
					<CurrentSite
						// Ignore type checking because TypeScript is incorrectly inferring the prop type due to JSX usage in <CurrentSite /> component
						// eslint-disable-next-line @typescript-eslint/ban-ts-comment
						// @ts-ignore
						forceAllSitesView
					/>
					<SidebarMenu>
						<SidebarItem
							customIcon={ <JetpackIcons icon="dashboard" /> }
							label={ translate( 'Dashboard', {
								comment: 'Jetpack sidebar navigation item',
							} ) }
							link="/dashboard"
							onNavigate={ onNavigate( 'Jetpack Cloud / Dashboard' ) }
							selected={ ! isPluginsPage }
						/>
						{ isPluginManagementEnabled && (
							<SidebarItem
								customIcon={ <Icon className="sidebar__menu-icon" size={ 28 } icon={ plugins } /> }
								label={ translate( 'Plugins', {
									comment: 'Jetpack sidebar navigation item',
								} ) }
								link="/plugins/manage"
								onNavigate={ onNavigate( 'Jetpack Cloud / Plugins' ) }
								selected={ isPluginsPage }
							/>
						) }
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
