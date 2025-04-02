/**
 * MySitesSidebarUnified
 *   Renders the Sidebar for "My Sites", except all of the menus and items are
 *   driven off a WPCom endpoint: /sites/${sideId}/admin-menu, which is loaded
 *   into state.adminMenu in a data layer.
 *
 *   Currently experimental/WIP.
 */

import { Spinner } from '@automattic/components';
import { translate } from 'i18n-calypso';
import { Fragment } from 'react';
import { useSelector } from 'react-redux';
import AsyncLoad from 'calypso/components/async-load';
import Sidebar from 'calypso/layout/sidebar';
import CollapseSidebar from 'calypso/layout/sidebar/collapse-sidebar';
import SidebarRegion from 'calypso/layout/sidebar/region';
import MySitesSidebarUnifiedBody from 'calypso/my-sites/sidebar/body';
import { getIsRequestingAdminMenu } from 'calypso/state/admin-menu/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import SiteNotices from '../current-site/site-notices';
import AddNewSite from './add-new-site';
import useDomainsViewStatus from './use-domains-view-status';
import useSiteMenuItems from './use-site-menu-items';
import 'calypso/state/admin-menu/init';

import './style.scss';

export const MySitesSidebarUnified = ( { path, isUnifiedSiteSidebarVisible } ) => {
	const menuItems = useSiteMenuItems();
	const isAllDomainsView = useDomainsViewStatus();
	const isRequestingMenu = useSelector( getIsRequestingAdminMenu );
	const selectedSite = useSelector( getSelectedSite );

	/**
	 * If there are no menu items and we are currently requesting some,
	 * then show a spinner. The check for menuItems is necessary because
	 * we may choose to render the menu from statically stored JSON data
	 * and therefore we need to be ready to render.
	 */
	if ( ! menuItems && isRequestingMenu ) {
		return <Spinner className="sidebar__menu-loading" />;
	}

	return (
		<Fragment>
			<Sidebar>
				{ isUnifiedSiteSidebarVisible && selectedSite && ! isAllDomainsView && (
					<SidebarRegion>
						<AsyncLoad
							require="calypso/my-sites/current-site/notice"
							placeholder={ null }
							site={ selectedSite }
						/>
					</SidebarRegion>
				) }
				{ ! isUnifiedSiteSidebarVisible && (
					<SidebarRegion>
						<SiteNotices />
					</SidebarRegion>
				) }
				<MySitesSidebarUnifiedBody
					path={ path }
					isUnifiedSiteSidebarVisible={ isUnifiedSiteSidebarVisible }
				/>
				<CollapseSidebar
					key="collapse"
					title={ translate( 'Collapse menu' ) }
					icon="dashicons-admin-collapse"
				/>
				<AddNewSite key="add-new-site" title={ translate( 'Add new site' ) } />
			</Sidebar>
		</Fragment>
	);
};

export default MySitesSidebarUnified;
