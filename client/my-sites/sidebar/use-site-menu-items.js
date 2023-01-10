import { isEnabled } from '@automattic/calypso-config';
import { useLocale } from '@automattic/i18n-utils';
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import domainOnlyFallbackMenu from 'calypso/my-sites/sidebar/static-data/domain-only-fallback-menu';
import { getAdminMenu } from 'calypso/state/admin-menu/selectors';
import { getPluginOnSite } from 'calypso/state/plugins/installed/selectors';
import { canAnySiteHavePlugins } from 'calypso/state/selectors/can-any-site-have-plugins';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import isDomainOnlySite from 'calypso/state/selectors/is-domain-only-site';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';
import { getSiteDomain, isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { requestAdminMenu } from '../../state/admin-menu/actions';
import allSitesMenu from './static-data/all-sites-menu';
import buildFallbackResponse from './static-data/fallback-menu';
import jetpackMenu from './static-data/jetpack-fallback-menu';

const useSiteMenuItems = () => {
	const dispatch = useDispatch();
	const selectedSiteId = useSelector( getSelectedSiteId );
	const siteDomain = useSelector( ( state ) => getSiteDomain( state, selectedSiteId ) );
	const menuItems = useSelector( ( state ) => getAdminMenu( state, selectedSiteId ) );
	const isJetpack = useSelector( ( state ) => isJetpackSite( state, selectedSiteId ) );
	const isAtomic = useSelector( ( state ) => isAtomicSite( state, selectedSiteId ) );
	const locale = useLocale();

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

	const shouldShowInbox = ! isP2;

	const shouldShowAddOnsInFallbackMenu = isEnabled( 'my-sites/add-ons' ) && ! isAtomic;

	const hasSiteWithPlugins = useSelector( canAnySiteHavePlugins );

	/**
	 * When no site domain is provided, lets show only menu items that support all sites screens.
	 */
	if ( ! siteDomain ) {
		return allSitesMenu( { showManagePlugins: hasSiteWithPlugins } );
	}

	/**
	 * When we have a jetpack connected site & we cannot retrieve the dynamic menu from that site.
	 */
	if ( isJetpack && ! isAtomic && ! menuItems ) {
		return jetpackMenu( { siteDomain } );
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
		shouldShowInbox,
		shouldShowAddOns: shouldShowAddOnsInFallbackMenu,
	};

	return menuItems ?? buildFallbackResponse( fallbackDataOverrides );
};

export default useSiteMenuItems;
