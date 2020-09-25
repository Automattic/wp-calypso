/**
 * MySitesSidebarUnified
 *   Renders the Sidebar for "My Sites", except all of the menus and items are
 *   driven off a WPCom endpoint: /sites/${sideId}/admin-menu, which is loaded
 *   into state.adminMenu in a data layer.
 *
 *    Currently experimental/WIP.
 **/

/**
 * External dependencies
 */
import React from 'react';
import { connect, useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import CurrentSite from 'my-sites/current-site';
import MySitesSidebarUnifiedItem from './item';
import MySitesSidebarUnifiedMenu from './menu';
import useSiteMenuItems from './use-site-menu-items';
import useDomainsViewStatus from './use-domains-view-status';
import { getIsRequestingAdminMenu } from 'state/admin-menu/selectors';
import Sidebar from 'layout/sidebar';
import SidebarSeparator from 'layout/sidebar/separator';
import 'layout/sidebar-unified/style.scss';
import 'state/admin-menu/init';
import Spinner from 'components/spinner';
import CollapseSidebar from './collapse-sidebar';
import { expandSidebar, collapseSidebar } from 'state/ui/actions';
import { getSidebarIsCollapsed } from 'state/ui/selectors';

import './style.scss';

export const MySitesSidebarUnified = ( { path, dispatch } ) => {
	const menuItems = useSiteMenuItems();
	const isAllDomainsView = useDomainsViewStatus();
	const isRequestingMenu = useSelector( getIsRequestingAdminMenu );
	const sidebarCollapsed = useSelector( getSidebarIsCollapsed );

	/**
	 * If there are no menu items and we are currently requesting some,
	 * then show a spinner. The check for menuItems is necessary because
	 * we may choose to render the menu from statically stored JSON data
	 * and therefore we need to be ready to render.
	 */
	if ( ! menuItems && isRequestingMenu ) {
		return <Spinner className="sidebar-unified__menu-loading" />;
	}

	return (
		<Sidebar>
			<CurrentSite forceAllSitesView={ isAllDomainsView } />
			{ menuItems.map( ( item, i ) => {
				if ( 'separator' === item?.type ) {
					return <SidebarSeparator key={ i } />;
				}

				if ( item?.children?.length ) {
					return <MySitesSidebarUnifiedMenu key={ item.slug } path={ path } { ...item } />;
				}

				return <MySitesSidebarUnifiedItem key={ item.slug } path={ path } { ...item } />;
			} ) }
			<CollapseSidebar
				key="collapse"
				title="Collapse menu"
				icon="dashicons-admin-collapse"
				onClick={ () =>
					sidebarCollapsed ? dispatch( expandSidebar ) : dispatch( collapseSidebar )
				}
			/>
		</Sidebar>
	);
};

export default connect()( MySitesSidebarUnified );
