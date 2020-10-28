/**
 * MySitesSidebarUnified
 *   Renders the Sidebar for "My Sites", except all of the menus and items are
 *   driven off a WPCom endpoint: /sites/${sideId}/admin-menu, which is loaded
 *   into state.adminMenu in a data layer.
 *
 *   Currently experimental/WIP.
 **/

/**
 * External dependencies
 */
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import CurrentSite from 'calypso/my-sites/current-site';
import MySitesSidebarUnifiedItem from './item';
import MySitesSidebarUnifiedMenu from './menu';
import CollapseSidebar from './collapse-sidebar';
import useSiteMenuItems from './use-site-menu-items';
import useDomainsViewStatus from './use-domains-view-status';
import { getIsRequestingAdminMenu } from 'calypso/state/admin-menu/selectors';
import Sidebar from 'calypso/layout/sidebar';
import SidebarSeparator from 'calypso/layout/sidebar/separator';
import 'calypso/state/admin-menu/init';
import Spinner from 'calypso/components/spinner';
import { itemLinkMatches } from '../sidebar/utils';
import { getSidebarIsCollapsed } from 'calypso/state/ui/selectors';
import './style.scss';

const masterbarHeight = 32;

export const MySitesSidebarUnified = ( { path } ) => {
	const menuItems = useSiteMenuItems();
	const isAllDomainsView = useDomainsViewStatus();
	const isRequestingMenu = useSelector( getIsRequestingAdminMenu );
	const sidebarIsCollapsed = useSelector( getSidebarIsCollapsed );
	const [ sidebarStyles, setSidebarStyles ] = useState( { top: 0 } );
	const sidebar = React.createRef();

	useEffect( () => {
		if (
			typeof window !== 'undefined' &&
			sidebar.current !== 'undefined' &&
			sidebar.current !== null &&
			sidebar.current.scrollHeight + masterbarHeight > window.innerHeight
		) {
			window.onscroll = () => {
				const currentScrollPos = window.pageYOffset;
				const maxScroll = sidebar.current.scrollHeight + masterbarHeight - window.innerHeight;
				if ( currentScrollPos >= 0 && currentScrollPos < maxScroll ) {
					setSidebarStyles( { top: -currentScrollPos } );
				} else {
					setSidebarStyles( { top: 'inherit' } );
				}
			};
		}

		// Need to cleanup
	}, [ sidebar ] );

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
		<Sidebar ref={ sidebar } style={ sidebarStyles }>
			<CurrentSite forceAllSitesView={ isAllDomainsView } />
			{ menuItems.map( ( item, i ) => {
				const isSelected = item?.url && itemLinkMatches( item.url, path );

				if ( 'separator' === item?.type ) {
					return <SidebarSeparator key={ i } />;
				}

				if ( item?.children?.length ) {
					return (
						<MySitesSidebarUnifiedMenu
							key={ item.slug }
							path={ path }
							link={ item.url }
							selected={ isSelected }
							sidebarCollapsed={ sidebarIsCollapsed }
							{ ...item }
						/>
					);
				}

				return <MySitesSidebarUnifiedItem key={ item.slug } selected={ isSelected } { ...item } />;
			} ) }
			<CollapseSidebar key="collapse" title="Collapse menu" icon="dashicons-admin-collapse" />
		</Sidebar>
	);
};

export default MySitesSidebarUnified;
