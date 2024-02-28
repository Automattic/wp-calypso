import { useSelector } from 'react-redux';
import Site from 'calypso/blocks/site';
import SidebarSeparator from 'calypso/layout/sidebar/separator';
import isSiteWpcomAtomic from 'calypso/state/selectors/is-site-wpcom-atomic';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import {
	getSidebarIsCollapsed,
	getSelectedSiteId,
	getSelectedSite,
} from 'calypso/state/ui/selectors';
import MySitesSidebarUnifiedItem from './item';
import MySitesSidebarUnifiedMenu from './menu';
import useSiteMenuItems from './use-site-menu-items';
import { itemLinkMatches } from './utils';
import 'calypso/state/admin-menu/init';

import './style.scss';

export const MySitesSidebarUnifiedBody = ( { path, children } ) => {
	const menuItems = useSiteMenuItems();
	const sidebarIsCollapsed = useSelector( getSidebarIsCollapsed );
	const site = useSelector( getSelectedSite );
	const siteId = useSelector( getSelectedSiteId );
	const isJetpack = useSelector( ( state ) => isJetpackSite( state, siteId ) );
	const isSiteAtomic = useSelector( ( state ) => isSiteWpcomAtomic( state, siteId ) );

	// Jetpack self-hosted sites should open external links to WP Admin in new tabs,
	// since WP Admin is considered a separate area from Calypso on those sites.
	const shouldOpenExternalLinksInCurrentTab = ! isJetpack || isSiteAtomic;

	return (
		<>
			{ menuItems &&
				menuItems.map( ( item, i ) => {
					const isSelected = item?.url && itemLinkMatches( item.url, path );

					if ( 'current-site' === item?.type ) {
						return (
							<Site key={ item.type } site={ site } href={ item?.url } isSelected={ isSelected } />
						);
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
