import { isEnabled } from '@automattic/calypso-config';
import { Icon, border } from '@wordpress/icons';
import { translate } from 'i18n-calypso';
import { createElement } from 'react';
import { useSelector } from 'react-redux';
import { useCurrentRoute } from 'calypso/components/route';
import domainOnlyFallbackMenu from 'calypso/my-sites/sidebar/static-data/domain-only-fallback-menu';
import { getAdminMenu } from 'calypso/state/admin-menu/selectors';
import { getAdminSidebarLayout } from 'calypso/state/admin-sidebar/layout/selectors';
import { hasDashboardOptIn } from 'calypso/state/dashboard/selectors';
import { getShouldShowGlobalSidebar } from 'calypso/state/global-sidebar/selectors';
import { getPluginOnSite } from 'calypso/state/plugins/installed/selectors';
import { canAnySiteHavePlugins } from 'calypso/state/selectors/can-any-site-have-plugins';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import { getCurrentRoute } from 'calypso/state/selectors/get-current-route';
import { hasSiteWithP2 } from 'calypso/state/selectors/has-site-with-p2';
import isDomainOnlySite from 'calypso/state/selectors/is-domain-only-site';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import isSiteWpcomStaging from 'calypso/state/selectors/is-site-wpcom-staging';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';
import { getSiteDomain, isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';
import allSitesMenu from './static-data/all-sites-menu';
import buildFallbackResponse from './static-data/fallback-menu';
import globalSidebarMenu from './static-data/global-sidebar-menu';
import jetpackMenu from './static-data/jetpack-fallback-menu';
import { applyLayoutDelta } from './utils/apply-layout-delta';
import { normalizeWpcomAdminSidebarHostLinks } from './utils/normalize-wpcom-admin-sidebar-host-links';

const useSiteMenuItems = ( layoutDeltaOverride, transformBaseMenu ) => {
	const currentRoute = useSelector( ( state ) => getCurrentRoute( state ) );
	const selectedSiteId = useSelector( getSelectedSiteId );
	const siteDomain = useSelector( ( state ) => getSiteDomain( state, selectedSiteId ) );
	const menuItems = useSelector( ( state ) => getAdminMenu( state, selectedSiteId ) );
	// Read the saved layout-delta so the redesigned (Phase 2) renderer applies
	// the user's persisted overrides. `null` for sites without saved deltas;
	// `applyLayoutDelta` is a no-op in that case so legacy callers see no
	// behaviour change.
	const savedLayoutDelta = useSelector( ( state ) =>
		getAdminSidebarLayout( state, selectedSiteId )
	);
	const layoutDelta = layoutDeltaOverride ?? savedLayoutDelta;
	const isJetpack = useSelector( ( state ) => isJetpackSite( state, selectedSiteId ) );
	const isAtomic = useSelector( ( state ) => isAtomicSite( state, selectedSiteId ) );
	const isStagingSite = useSelector( ( state ) => isSiteWpcomStaging( state, selectedSiteId ) );
	const isPlanExpired = useSelector( ( state ) => !! getSelectedSite( state )?.plan?.expired );
	const isAllDomainsView = '/domains/manage' === currentRoute;
	const { currentSection, currentRoute: route } = useCurrentRoute();
	const shouldShowGlobalSidebar = useSelector( ( state ) => {
		return getShouldShowGlobalSidebar( {
			state,
			siteId: selectedSiteId,
			section: currentSection,
			route,
		} );
	} );

	/**
	 * As a general rule we allow fallback data to remain as static as possible.
	 * Therefore we should avoid relying on API responses to determine what is/isn't
	 * shown in the fallback data as then we have a situation where we are waiting on
	 * network requests to display fallback data when it should be possible to display
	 * without this. There are a couple of exceptions to this below where the menu items
	 * are sufficiently important to the UX that it is worth attempting the API request
	 * to determine whether or not the menu item should show in the fallback data.
	 */
	const shouldShowWooCommerce = useSelector(
		( state ) => !! ( isJetpack && getPluginOnSite( state, selectedSiteId, 'woocommerce' )?.active )
	);
	const shouldShowThemes = useSelector( ( state ) =>
		canCurrentUser( state, selectedSiteId, 'edit_theme_options' )
	);

	const isP2 = useSelector( ( state ) => !! isSiteWPForTeams( state, selectedSiteId ) );
	const isDomainOnly = useSelector( ( state ) => isDomainOnlySite( state, selectedSiteId ) );

	const shouldShowMailboxes = ! isP2;

	const shouldShowAddOns = ! isAtomic && ! isStagingSite;

	const hasSiteWithPlugins = useSelector( canAnySiteHavePlugins );
	const showP2s = useSelector( hasSiteWithP2 );

	const hasUnifiedImporter = isEnabled( 'importer/unified' );

	const dashboardOptIn = useSelector( ( state ) => hasDashboardOptIn( state ) );

	if ( shouldShowGlobalSidebar ) {
		return globalSidebarMenu( {
			showP2s: showP2s,
			hasOptIn: dashboardOptIn,
		} );
	}

	/**
	 * When no site domain is provided, lets show only menu items that support all sites screens.
	 */
	if ( ! siteDomain || isAllDomainsView ) {
		return allSitesMenu( { showManagePlugins: hasSiteWithPlugins } );
	}

	/**
	 * When we have a jetpack connected site & we cannot retrieve the dynamic menu from that site.
	 */
	if ( isJetpack && ! isAtomic && ! menuItems ) {
		return jetpackMenu( { siteDomain, hasUnifiedImporter } );
	}

	/**
	 * When we have a domain-only site & we cannot retrieve the dynamic menu from that site.
	 */
	if ( isDomainOnly && ! menuItems ) {
		return domainOnlyFallbackMenu( { siteDomain } );
	}

	/**
	 * Overrides for the static fallback data which will be displayed if/when there are
	 * no menu items in the API response or the API response has yet to be cached in
	 * browser storage APIs.
	 */
	const fallbackDataOverrides = {
		siteDomain,
		isAtomic,
		isPlanExpired,
		shouldShowWooCommerce,
		shouldShowThemes,
		shouldShowMailboxes,
		shouldShowAddOns,
		showSiteMonitoring: isAtomic,
	};

	const isMyHomeItem = ( item ) =>
		item.slug === 'home' ||
		item.icon === 'dashicons-admin-home' ||
		( typeof item.url === 'string' && /\/home\/[^/]+\/?$/.test( item.url ) );

	// The prototype repurposes the My Home route (/home) as the AI "Site Setup"
	// surface, and brings back the real wp-admin Dashboard (index-php) as its
	// own item directly beneath it. Order is forced: Site Setup first, then
	// Dashboard, then the rest of the admin menu (unchanged).
	// WPDS "border" icon (a framed square) for the Site Setup item — passed as a
	// React element, which SidebarCustomIcon renders directly. Sized to 24px to
	// match the dashicon glyphs on the other menu items.
	const SITE_SETUP_ICON = createElement( Icon, {
		icon: border,
		size: 24,
		className: 'sidebar__menu-icon',
	} );
	const transformDashboardItem = ( items ) => {
		if ( ! items ) {
			return items;
		}
		const mapped = items.map( ( item ) => {
			if ( isMyHomeItem( item ) ) {
				return { ...item, icon: SITE_SETUP_ICON, title: translate( 'Site Setup' ) };
			}
			// Restore the real wp-admin Dashboard (was filtered out so /home could
			// stand in as "Dashboard"). Keep its dashboard icon + label.
			if ( item.slug === 'index-php' ) {
				return { ...item, icon: 'dashicons-dashboard', title: translate( 'Dashboard' ) };
			}
			return item;
		} );
		const siteSetup = mapped.find( isMyHomeItem );
		const dashboard = mapped.find( ( item ) => item.slug === 'index-php' );
		const rest = mapped.filter( ( item ) => ! isMyHomeItem( item ) && item.slug !== 'index-php' );
		return [
			...( siteSetup ? [ siteSetup ] : [] ),
			...( dashboard ? [ dashboard ] : [] ),
			...rest,
		];
	};

	// Prototype: rename /home → "Site Setup" + restore the wp-admin Dashboard,
	// then feed the result through trunk's sidebar-customization pipeline
	// (transformBaseMenu → host-link normalize → user layout-delta).
	const baseMenu =
		transformDashboardItem( menuItems ) ?? buildFallbackResponse( fallbackDataOverrides );
	const transformedBaseMenu =
		typeof transformBaseMenu === 'function' ? transformBaseMenu( baseMenu ) : baseMenu;
	const normalizedBaseMenu = normalizeWpcomAdminSidebarHostLinks( transformedBaseMenu );
	// Apply the user's saved layout-delta (Phase 2 task 2.5). When no delta
	// is stored, `applyLayoutDelta` returns a copy of `baseMenu` unmodified.
	// The cost on the no-delta path is one shallow array clone per render;
	// memoisation lives upstream where the menu is read.
	return applyLayoutDelta( normalizedBaseMenu, layoutDelta );
};

export default useSiteMenuItems;
