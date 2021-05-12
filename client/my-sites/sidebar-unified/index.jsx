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
import { useSelector, useDispatch } from 'react-redux';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import AsyncLoad from 'calypso/components/async-load';
import CurrentSite from 'calypso/my-sites/current-site';
import MySitesSidebarUnifiedItem from './item';
import MySitesSidebarUnifiedMenu from './menu';
import CollapseSidebar from './collapse-sidebar';
import AddNewSite from './add-new-site';
import useSiteMenuItems from './use-site-menu-items';
import useDomainsViewStatus from './use-domains-view-status';
import { getIsRequestingAdminMenu } from 'calypso/state/admin-menu/selectors';
import Sidebar from 'calypso/layout/sidebar';
import SidebarSeparator from 'calypso/layout/sidebar/separator';
import SidebarRegion from 'calypso/layout/sidebar/region';
import 'calypso/state/admin-menu/init';
import Spinner from 'calypso/components/spinner';
import { itemLinkMatches } from './utils';
import { getSidebarIsCollapsed, getSelectedSiteId } from 'calypso/state/ui/selectors';
import hasActiveHappychatSession from 'calypso/state/happychat/selectors/has-active-happychat-session';
import { isExternal } from 'calypso/lib/url';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import isSiteWpcomAtomic from 'calypso/state/selectors/is-site-wpcom-atomic';

import './style.scss';

export const MySitesSidebarUnified = ( { path } ) => {
	const dispatch = useDispatch();
	const menuItems = useSiteMenuItems();
	const isAllDomainsView = useDomainsViewStatus();
	const isRequestingMenu = useSelector( getIsRequestingAdminMenu );
	const sidebarIsCollapsed = useSelector( getSidebarIsCollapsed );
	const isHappychatSessionActive = useSelector( hasActiveHappychatSession );
	const siteId = useSelector( getSelectedSiteId );
	const isJetpack = useSelector( ( state ) => isJetpackSite( state, siteId ) );
	const isSiteAtomic = useSelector( ( state ) => isSiteWpcomAtomic( state, siteId ) );
	const isJetpackNonAtomicSite = isJetpack && ! isSiteAtomic;
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
			// Do not show warning modal on Jetpack sites, since all external links are
			// always opened on new tabs for these sites.
			if ( isJetpackNonAtomicSite ) {
				return false;
			}

			event && event.preventDefault();
			setExternalUrl( url );
			setShowDialog( true );
			dispatch(
				recordTracksEvent( 'calypso_nav_unification_external_link_dialog_show', {
					link: url,
				} )
			);
			return false;
		}
		return true;
	};

	const closeModalHandler = ( openUrl ) => {
		setShowDialog( false );
		if ( openUrl ) {
			window.open( externalUrl );
			dispatch(
				recordTracksEvent( 'calypso_nav_unification_external_link_dialog_continue', {
					link: externalUrl,
				} )
			);
		}
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
								isHappychatSessionActive={ isHappychatSessionActive }
								isJetpackNonAtomicSite={ isJetpackNonAtomicSite }
								continueInCalypso={ continueInCalypso }
								{ ...item }
							/>
						);
					}

					return (
						<MySitesSidebarUnifiedItem
							key={ item.slug }
							selected={ isSelected }
							isHappychatSessionActive={ isHappychatSessionActive }
							isJetpackNonAtomicSite={ isJetpackNonAtomicSite }
							continueInCalypso={ continueInCalypso }
							{ ...item }
						/>
					);
				} ) }
				<AddNewSite
					key="add-new-site"
					title={ translate( 'Add new site' ) }
					icon="dashicons-plus-alt"
				/>
				<CollapseSidebar
					key="collapse"
					title={ translate( 'Collapse menu' ) }
					icon="dashicons-admin-collapse"
				/>
			</Sidebar>
			<AsyncLoad require="calypso/blocks/nav-unification-modal" placeholder={ null } />
			<AsyncLoad
				require="calypso/my-sites/sidebar-unified/external-link-dialog"
				isVisible={ showDialog }
				closeModalHandler={ closeModalHandler }
			/>
		</Fragment>
	);
};

export default MySitesSidebarUnified;
