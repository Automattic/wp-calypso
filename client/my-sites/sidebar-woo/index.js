/**
 * MySitesSidebarWoo
 *   Renders the Woo Sidebar for Woo.com sites. Menu items are fetched
 *   from the WPCom endpoint: /sites/${sideId}/woo-admin-menu, which is loaded
 *   into state.wooAdminMenu in a data layer.
 *
 *   Currently experimental/WIP.
 */

import { AdminMenu } from '@woo/components';
import { useSelector } from 'react-redux';
import Spinner from 'calypso/components/spinner';
import { getIsRequestingAdminMenu } from 'calypso/state/admin-menu/selectors';
import useSiteMenu from './use-site-menus';
import 'calypso/state/admin-menu/init';

export const MySitesSidebarWoo = () => {
	const menus = useSiteMenu();
	const isRequestingMenu = useSelector( getIsRequestingAdminMenu );

	/**
	 * If there are no menu items and we are currently requesting some,
	 * then show a spinner. The check for menuItems is necessary because
	 * we may choose to render the menu from statically stored JSON data
	 * and therefore we need to be ready to render.
	 */
	if ( ! menus && isRequestingMenu ) {
		return <Spinner className="sidebar-woo__menu-loading" />;
	}

	if ( ! menus ) {
		return null;
	}

	return <AdminMenu menus={ menus } />;
};

export default MySitesSidebarWoo;
