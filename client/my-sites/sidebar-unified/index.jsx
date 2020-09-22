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
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import CurrentSite from 'my-sites/current-site';
import MySitesSidebarUnifiedItem from './item';
import MySitesSidebarUnifiedMenu from './menu';
import useSiteMenuItems from './use-site-menu-items';
import Sidebar from 'layout/sidebar';
import SidebarSeparator from 'layout/sidebar/separator';
import { getIsAllDomainsView } from 'state/admin-menu/selectors';
import 'layout/sidebar-unified/style.scss';
import 'state/admin-menu/init';

export const MySitesSidebarUnified = ( { path } ) => {
	const isAllDomainsView = useSelector( getIsAllDomainsView );
	const menuItems = useSiteMenuItems();

	return (
		<Sidebar>
			<CurrentSite forceAllSitesView={ isAllDomainsView } />
			{ menuItems.map( ( item, i ) => {
				if ( 'separator' === item?.type ) {
					return <SidebarSeparator key={ i } />;
				}

				if ( item?.children && Object.keys( item.children ).length ) {
					return <MySitesSidebarUnifiedMenu key={ item.slug } path={ path } { ...item } />;
				}

				return <MySitesSidebarUnifiedItem isTopLevel key={ item.slug } path={ path } { ...item } />;
			} ) }
		</Sidebar>
	);
};
export default MySitesSidebarUnified;
