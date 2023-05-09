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
import { Fragment, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import AsyncLoad from 'calypso/components/async-load';
import Sidebar from 'calypso/layout/sidebar';
import CollapseSidebar from 'calypso/layout/sidebar/collapse-sidebar';
import SidebarRegion from 'calypso/layout/sidebar/region';
import SidebarSeparator from 'calypso/layout/sidebar/separator';
import { isExternal } from 'calypso/lib/url';
import CurrentSite from 'calypso/my-sites/current-site';
import { getIsRequestingAdminMenu } from 'calypso/state/admin-menu/selectors';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import hasActiveHappychatSession from 'calypso/state/happychat/selectors/has-active-happychat-session';
import isSiteWpcomAtomic from 'calypso/state/selectors/is-site-wpcom-atomic';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSidebarIsCollapsed, getSelectedSiteId } from 'calypso/state/ui/selectors';
import AddNewSite from './add-new-site';
import MySitesSidebarUnifiedItem from './item';
import MySitesSidebarUnifiedMenu from './menu';
import useDomainsViewStatus from './use-domains-view-status';
import useSiteMenuItems from './use-site-menu-items';
import { itemLinkMatches } from './utils';
import 'calypso/state/admin-menu/init';

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
	const [ showDialog, setShowDialog ] = useState( false );
	const [ externalUrl, setExternalUrl ] = useState();

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

	/**
	 * Checks whether the user can navigate to the given URL. Users contacting support
	 * via Happychat should be refrained from visiting external links in the current
	 * browser tab, since that would terminates the chat. We instead show a modal
	 * awaiting for user confirmation to visit it on a new tab, so the active Happychat
	 * session in the current tab is not affected.
	 *
	 * @param {string} url The URL to check.
	 * @returns {boolean} Whether the user is allowed to navigate.
	 */
	const canNavigate = ( url ) => {
		if ( isHappychatSessionActive && isExternal( url ) && shouldOpenExternalLinksInCurrentTab ) {
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
								shouldOpenExternalLinksInCurrentTab={ shouldOpenExternalLinksInCurrentTab }
								canNavigate={ canNavigate }
								{ ...item }
							/>
						);
					}

					return (
						<MySitesSidebarUnifiedItem
							key={ item.slug }
							selected={ isSelected }
							shouldOpenExternalLinksInCurrentTab={ shouldOpenExternalLinksInCurrentTab }
							canNavigate={ canNavigate }
							{ ...item }
						/>
					);
				} ) }
				<CollapseSidebar
					key="collapse"
					title={ translate( 'Collapse menu' ) }
					icon="dashicons-admin-collapse"
				/>
				<AddNewSite key="add-new-site" title={ translate( 'Add new site' ) } />
			</Sidebar>
			<AsyncLoad
				require="calypso/my-sites/sidebar/external-link-dialog"
				isVisible={ showDialog }
				closeModalHandler={ closeModalHandler }
			/>
		</Fragment>
	);
};

export default MySitesSidebarUnified;
