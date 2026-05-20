import { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import Site from 'calypso/blocks/site';
import SidebarSeparator from 'calypso/layout/sidebar/separator';
import { isP2Theme } from 'calypso/lib/site/utils';
import { getAdminMenuGroups } from 'calypso/state/admin-menu/selectors';
import isSiteWpcomAtomic from 'calypso/state/selectors/is-site-wpcom-atomic';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import {
	getSidebarIsCollapsed,
	getSelectedSiteId,
	getSelectedSite,
} from 'calypso/state/ui/selectors';
import { CustomizeProvider, useCustomizeContext } from './customize';
import { CustomizeFooter } from './customize/footer';
import MySitesSidebarUnifiedItem from './item';
import MySitesSidebarUnifiedMenu from './menu';
import MySitesSidebarUnifiedSidebarGroup from './sidebar-group';
import useSiteMenuItems from './use-site-menu-items';
import { isItemSelected } from './utils';
import {
	applyAdminSidebarDevMock,
	getAdminSidebarDevMockGroups,
	isAdminSidebarDevMockActive,
} from './utils/admin-sidebar-dev-mock';
import groupMenuItems from './utils/group-menu-items';
import 'calypso/state/admin-menu/init';
import 'calypso/state/admin-sidebar/expand-state/init';
import 'calypso/state/admin-sidebar/layout/init';

import './style.scss';

export const MySitesSidebarUnifiedBody = ( {
	isGlobalSidebarCollapsed,
	path,
	children,
	onMenuItemClick,
	isUnifiedSiteSidebarVisible,
} ) => (
	<CustomizeProvider>
		<MySitesSidebarUnifiedBodyContent
			isGlobalSidebarCollapsed={ isGlobalSidebarCollapsed }
			path={ path }
			onMenuItemClick={ onMenuItemClick }
			isUnifiedSiteSidebarVisible={ isUnifiedSiteSidebarVisible }
		>
			{ children }
		</MySitesSidebarUnifiedBodyContent>
		<CustomizeFooter />
	</CustomizeProvider>
);

function MySitesSidebarUnifiedBodyContent( {
	isGlobalSidebarCollapsed,
	path,
	children,
	onMenuItemClick,
	isUnifiedSiteSidebarVisible,
} ) {
	const customizeCtx = useCustomizeContext();
	const workingDelta = customizeCtx?.isCustomizing ? customizeCtx.draft.workingDelta : undefined;
	const sidebarIsCollapsed = useSelector( getSidebarIsCollapsed );
	const site = useSelector( getSelectedSite );
	const siteId = useSelector( getSelectedSiteId );
	const isJetpack = useSelector( ( state ) => isJetpackSite( state, siteId ) );
	const isSiteAtomic = useSelector( ( state ) => isSiteWpcomAtomic( state, siteId ) );
	const groups = useSelector( ( state ) => getAdminMenuGroups( state, siteId ) );
	const transformBaseMenu = useCallback(
		( baseMenu ) => applyAdminSidebarDevMock( baseMenu, groups ).menuItems,
		[ groups ]
	);
	const menuItems = useSiteMenuItems( workingDelta, transformBaseMenu );
	const isP2Site =
		useSelector( ( state ) => isSiteWPForTeams( state, siteId ) ) ||
		( site?.options?.theme_slug && isP2Theme( site?.options?.theme_slug ) );

	// Jetpack self-hosted sites should open external links to WP Admin in new tabs,
	// since WP Admin is considered a separate area from Calypso on those sites.
	const shouldOpenExternalLinksInCurrentTab = ! isJetpack || isSiteAtomic;

	// Phase 1 redesign: partition the flat menu into top-level items plus group
	// sections. Until the endpoint emits `groups[]`, all items remain ungrouped
	// and the legacy flat shape is preserved.
	const renderGroups = useMemo(
		() => ( isAdminSidebarDevMockActive() ? getAdminSidebarDevMockGroups() : groups ),
		[ groups ]
	);
	const { ungroupedItems, groupedSections } = useMemo(
		() =>
			groupMenuItems( menuItems ?? [], renderGroups, {
				includeEmptyGroups: customizeCtx?.isCustomizing === true,
			} ),
		[ menuItems, renderGroups, customizeCtx?.isCustomizing ]
	);

	const renderItem = ( item, i ) => {
		const isSelected = isItemSelected( item, path, site, isP2Site );

		if ( 'current-site' === item?.type ) {
			return (
				<Site
					key={ item.type }
					site={ site }
					href={ item?.url }
					isSelected={ isSelected }
					onSelect={ () => onMenuItemClick( item?.url ) }
				/>
			);
		}
		if ( 'separator' === item?.type ) {
			return <SidebarSeparator key={ `sep-${ i }` } />;
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
					isUnifiedSiteSidebarVisible={ isUnifiedSiteSidebarVisible }
					{ ...item }
				/>
			);
		}

		return (
			<MySitesSidebarUnifiedItem
				key={ item.slug }
				selected={ isSelected }
				shouldOpenExternalLinksInCurrentTab={ shouldOpenExternalLinksInCurrentTab }
				showTooltip={ !! isGlobalSidebarCollapsed }
				trackClickEvent={ onMenuItemClick }
				{ ...item }
			/>
		);
	};

	return (
		<>
			{ ungroupedItems.map( ( item, i ) => renderItem( item, i ) ) }
			{ groupedSections.map( ( section ) => (
				<MySitesSidebarUnifiedSidebarGroup
					key={ `group-${ section.group.id }` }
					group={ section.group }
				>
					{ section.items.map( ( item, i ) => renderItem( item, i ) ) }
				</MySitesSidebarUnifiedSidebarGroup>
			) ) }
			{ children }
		</>
	);
}

export default MySitesSidebarUnifiedBody;
