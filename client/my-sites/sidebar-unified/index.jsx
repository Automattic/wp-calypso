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
import React, { Fragment, useState } from 'react';
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import AsyncLoad from 'calypso/components/async-load';
import CurrentSite from 'calypso/my-sites/current-site';
import MySitesSidebarUnifiedItem from './item';
import MySitesSidebarUnifiedMenu from './menu';
import ExternalLinkDialog from './external-link-dialog';
import CollapseSidebar from './collapse-sidebar';
import useSiteMenuItems from './use-site-menu-items';
import useDomainsViewStatus from './use-domains-view-status';
import { getIsRequestingAdminMenu } from 'calypso/state/admin-menu/selectors';
import Sidebar from 'calypso/layout/sidebar';
import SidebarSeparator from 'calypso/layout/sidebar/separator';
import SidebarRegion from 'calypso/layout/sidebar/region';
import 'calypso/state/admin-menu/init';
import Spinner from 'calypso/components/spinner';
import { itemLinkMatches } from '../sidebar/utils';
import { getSidebarIsCollapsed } from 'calypso/state/ui/selectors';
import hasActiveHappychatSession from 'calypso/state/happychat/selectors/has-active-happychat-session';
import { isExternal } from 'calypso/lib/url';

import './style.scss';

export const MySitesSidebarUnified = ( { path } ) => {
	const menuItems = useSiteMenuItems();
	const isAllDomainsView = useDomainsViewStatus();
	const isRequestingMenu = useSelector( getIsRequestingAdminMenu );
	const sidebarIsCollapsed = useSelector( getSidebarIsCollapsed );
	const isHappychatSessionActive = useSelector( ( state ) => hasActiveHappychatSession( state ) );
	const [ showDialog, setShowDialog ] = useState( false );
	const [ externalUrl, setExternalUrl ] = useState();

	/**
	 * If there are no menu items and we are currently requesting some,
	 * then show a spinner. The check for menuItems is necessary because
	 * we may choose to render the menu from statically stored JSON data
	 * and therefore we need to be ready to render.
	 */
	if ( ! menuItems && isRequestingMenu ) {
		return <Spinner className="sidebar-unified__menu-loading" />;
	}

	// Checks if there is a Happy Chat active and user clicks on an External link.
	// On which case we show a modal awaiting for user confirmation for opening that
	// link on new tab in order to avoid Happy Chat session disconnection.
	// We return a bool that shows if the logic should terminate here.
	const continueInCalypso = ( url, event ) => {
		if ( isHappychatSessionActive && isExternal( url ) ) {
			event && event.preventDefault();
			setExternalUrl( url );
			setShowDialog( true );
			return false;
		}
		return true;
	};

	const closeModalHandler = ( openUrl ) => {
		setShowDialog( false );
		openUrl && window.open( externalUrl );
	};

	return (
		<Fragment>
			<Sidebar>
				<SidebarRegion>
					<CurrentSite forceAllSitesView={ isAllDomainsView } />
				</SidebarRegion>
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
								continueInCalypso={ continueInCalypso }
								{ ...item }
							/>
						);
					}

					return (
						<MySitesSidebarUnifiedItem
							key={ item.slug }
							selected={ isSelected }
							continueInCalypso={ continueInCalypso }
							{ ...item }
						/>
					);
				} ) }
				<CollapseSidebar key="collapse" title="Collapse menu" icon="dashicons-admin-collapse" />
			</Sidebar>
			<ExternalLinkDialog
				isVisible={ showDialog }
				closeModalHandler={ ( openUrl ) => closeModalHandler( openUrl ) }
			/>
			<AsyncLoad require="calypso/blocks/nav-unification-modal" placeholder={ null } />
		</Fragment>
	);
};

export default MySitesSidebarUnified;
