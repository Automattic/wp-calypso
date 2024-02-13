/**
 * MySitesSidebarUnified
 *   Renders the Sidebar for "My Sites", except all of the menus and items are
 *   driven off a WPCom endpoint: /sites/${sideId}/admin-menu, which is loaded
 *   into state.adminMenu in a data layer.
 *
 *   Currently experimental/WIP.
 */

import { Spinner } from '@automattic/components';
import { Fragment } from 'react';
import { useSelector } from 'react-redux';
import Sidebar from 'calypso/layout/sidebar';
import SidebarSeparator from 'calypso/layout/sidebar/separator';
import { getIsRequestingAdminMenu } from 'calypso/state/admin-menu/selectors';
import isSiteWpcomAtomic from 'calypso/state/selectors/is-site-wpcom-atomic';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSidebarIsCollapsed, getSelectedSiteId } from 'calypso/state/ui/selectors';
import MySitesSidebarUnifiedItem from './item';
import MySitesSidebarUnifiedMenu from './menu';
import useSiteMenuItems from './use-site-menu-items';
import { itemLinkMatches } from './utils';
import 'calypso/state/admin-menu/init';

import './style.scss';

export const MySitesSidebarUnified = ( { path } ) => {
	const menuItems = useSiteMenuItems();
	const isRequestingMenu = useSelector( getIsRequestingAdminMenu );
	const sidebarIsCollapsed = useSelector( getSidebarIsCollapsed );
	const siteId = useSelector( getSelectedSiteId );
	const isJetpack = useSelector( ( state ) => isJetpackSite( state, siteId ) );
	const isSiteAtomic = useSelector( ( state ) => isSiteWpcomAtomic( state, siteId ) );

	/**
	 * If there are no menu items and we are currently requesting some,
	 * then show a spinner. The check for menuItems is necessary because
	 * we may choose to render the menu from statically stored JSON data
	 * and therefore we need to be ready to render.
	 */
	if ( ! menuItems && isRequestingMenu ) {
		return <Spinner className="sidebar__menu-loading" />;
	}

	// Jetpack self-hosted sites should open external links to WP Admin in new tabs,
	// since WP Admin is considered a separate area from Calypso on those sites.
	const shouldOpenExternalLinksInCurrentTab = ! isJetpack || isSiteAtomic;

	return (
		<Fragment>
			<Sidebar>
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
								shouldOpenExternalLinksInCurrentTab={ shouldOpenExternalLinksInCurrentTab }
								{ ...item }
							/>
						);
					}

					return (
						<MySitesSidebarUnifiedItem
							key={ item.slug }
							selected={ isSelected }
							shouldOpenExternalLinksInCurrentTab={ shouldOpenExternalLinksInCurrentTab }
							{ ...item }
						/>
					);
				} ) }
			</Sidebar>
		</Fragment>
	);
};

export default MySitesSidebarUnified;
