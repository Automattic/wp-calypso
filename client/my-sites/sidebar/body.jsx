import { useSelector } from 'react-redux';
import { useCurrentRoute } from 'calypso/components/route';
import { useGlobalSidebar } from 'calypso/layout/global-sidebar/hooks/use-global-sidebar';
import SidebarSeparator from 'calypso/layout/sidebar/separator';
import isNotificationsOpen from 'calypso/state/selectors/is-notifications-open';
import isSiteWpcomAtomic from 'calypso/state/selectors/is-site-wpcom-atomic';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSidebarIsCollapsed, getSelectedSiteId } from 'calypso/state/ui/selectors';
import MySitesSidebarUnifiedItem from './item';
import MySitesSidebarUnifiedMenu from './menu';
import useSiteMenuItems from './use-site-menu-items';
import { itemLinkMatches } from './utils';
import 'calypso/state/admin-menu/init';

import './style.scss';

export const MySitesSidebarUnifiedBody = ( { path, children } ) => {
	const menuItems = useSiteMenuItems();
	const sidebarIsCollapsed = useSelector( getSidebarIsCollapsed );
	const siteId = useSelector( getSelectedSiteId );
	const isJetpack = useSelector( ( state ) => isJetpackSite( state, siteId ) );
	const isSiteAtomic = useSelector( ( state ) => isSiteWpcomAtomic( state, siteId ) );
	const isNotificationsPanelOpen = useSelector( ( state ) => isNotificationsOpen( state ) );
	const { currentSection } = useCurrentRoute();
	const shouldShowGlobalSidebar = useGlobalSidebar( siteId, currentSection );

	// Jetpack self-hosted sites should open external links to WP Admin in new tabs,
	// since WP Admin is considered a separate area from Calypso on those sites.
	const shouldOpenExternalLinksInCurrentTab = ! isJetpack || isSiteAtomic;

	return (
		<>
			{ menuItems.map( ( item, i ) => {
				let isSelected = item?.url && itemLinkMatches( item.url, path );

				if ( shouldShowGlobalSidebar && isNotificationsPanelOpen ) {
					// The notifications panel is open, so we should not highlight the notifications menu item in the global sidebar.
					isSelected = false;
				}

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
			{ children }
		</>
	);
};

export default MySitesSidebarUnifiedBody;
