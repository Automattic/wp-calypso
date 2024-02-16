import { isEnabled } from '@automattic/calypso-config';
import { useLocale } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useCurrentRoute } from 'calypso/components/route';
import { useGlobalSidebar } from 'calypso/layout/global-sidebar/hooks/use-global-sidebar';
import domainOnlyFallbackMenu from 'calypso/my-sites/sidebar/static-data/domain-only-fallback-menu';
import { getAdminMenu } from 'calypso/state/admin-menu/selectors';
import { getPluginOnSite } from 'calypso/state/plugins/installed/selectors';
import { canAnySiteHavePlugins } from 'calypso/state/selectors/can-any-site-have-plugins';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import { getCurrentRoute } from 'calypso/state/selectors/get-current-route';
import isDomainOnlySite from 'calypso/state/selectors/is-domain-only-site';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';
import { getSiteDomain, isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { requestAdminMenu } from '../../state/admin-menu/actions';
import { getSiteOption } from '../../state/sites/selectors';
import allSitesMenu from './static-data/all-sites-menu';
import buildFallbackResponse from './static-data/fallback-menu';
import globalSidebarMenu from './static-data/global-sidebar-menu';
import globalSiteSidebarMenu from './static-data/global-site-sidebar-menu';
import jetpackMenu from './static-data/jetpack-fallback-menu';

const useSiteMenuItems = () => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const currentRoute = useSelector( ( state ) => getCurrentRoute( state ) );
	const selectedSiteId = useSelector( getSelectedSiteId );
	const siteDomain = useSelector( ( state ) => getSiteDomain( state, selectedSiteId ) );
	const menuItems = useSelector( ( state ) => getAdminMenu( state, selectedSiteId ) );
	const isJetpack = useSelector( ( state ) => isJetpackSite( state, selectedSiteId ) );
	const isAtomic = useSelector( ( state ) => isAtomicSite( state, selectedSiteId ) );
	const locale = useLocale();
	const isAllDomainsView = '/domains/manage' === currentRoute;
	const { currentSection } = useCurrentRoute();
	const adminInterface = useSelector( ( state ) =>
		getSiteOption( state, selectedSiteId, 'wpcom_admin_interface' )
	);
	const { shouldShowGlobalSidebar, shouldShowGlobalSiteSidebar } = useGlobalSidebar(
		selectedSiteId,
		currentSection?.group
	);

	useEffect( () => {
		if ( selectedSiteId && siteDomain ) {
			dispatch( requestAdminMenu( selectedSiteId ) );
		}
	}, [ dispatch, selectedSiteId, siteDomain, locale ] );

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

	const shouldShowAddOnsInFallbackMenu = isEnabled( 'my-sites/add-ons' ) && ! isAtomic;

	const hasSiteWithPlugins = useSelector( canAnySiteHavePlugins );

	const hasUnifiedImporter = isEnabled( 'importer/unified' );

	// Temporary patch to force display Github deployments menu item for testing (Cft).
	// This can be removed once testing is complete.
	const menuItemsWithGithubDeployments = useMemo( () => {
		if (
			! isJetpack ||
			! Array.isArray( menuItems ) ||
			menuItems.length === 0 ||
			! isEnabled( 'github-deployments' )
		) {
			return menuItems;
		}

		return menuItems.map( ( menuItem ) => {
			if ( menuItem.icon === 'dashicons-admin-tools' && Array.isArray( menuItem.children ) ) {
				const githubDeploymentsExist = menuItem.children.some(
					( child ) => child.url && child.url.startsWith( '/github-deployments/' )
				);

				if ( ! githubDeploymentsExist ) {
					return {
						...menuItem,
						children: [
							...menuItem.children,
							{
								parent: menuItem.children[ 0 ].parent,
								slug: 'tools-github-deployments',
								title: translate( 'GitHub Deployments' ),
								type: 'submenu-item',
								url: `/github-deployments/${ siteDomain }`,
							},
						],
					};
				}
			}
			return menuItem;
		} );
	}, [ isJetpack, menuItems, siteDomain, translate ] );

	if ( shouldShowGlobalSidebar ) {
		return globalSidebarMenu();
	}
	// Global Site View should be limited to classic interface users only for now.
	if ( shouldShowGlobalSiteSidebar && adminInterface === 'wp-admin' ) {
		return globalSiteSidebarMenu( {
			siteDomain,
			shouldShowAddOns: shouldShowAddOnsInFallbackMenu,
			showSiteMonitoring: isAtomic,
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
		shouldShowWooCommerce,
		shouldShowThemes,
		shouldShowMailboxes,
		shouldShowAddOns: shouldShowAddOnsInFallbackMenu,
		showSiteMonitoring: isAtomic,
	};

	return menuItemsWithGithubDeployments ?? buildFallbackResponse( fallbackDataOverrides );
};

export default useSiteMenuItems;
