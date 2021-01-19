/**
 * External dependencies
 */
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestAdminMenu } from '../../state/admin-menu/actions';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { getAdminMenu } from 'calypso/state/admin-menu/selectors';
import { getSiteDomain } from 'calypso/state/sites/selectors';
import canCurrentUser from 'calypso/state/selectors/can-current-user';
import buildFallbackResponse from './static-data/fallback-menu';
import allSitesMenu from './static-data/all-sites-menu';

import { getPluginOnSite } from 'calypso/state/plugins/installed/selectors';
import { fetchPlugins } from 'calypso/state/plugins/installed/actions';

const useSiteMenuItems = () => {
	const dispatch = useDispatch();
	const selectedSiteId = useSelector( getSelectedSiteId );
	const siteDomain = useSelector( ( state ) => getSiteDomain( state, selectedSiteId ) );
	const menuItems = useSelector( ( state ) => getAdminMenu( state, selectedSiteId ) );

	useEffect( () => {
		if ( null !== selectedSiteId && null !== siteDomain ) {
			dispatch( requestAdminMenu( selectedSiteId ) );
			dispatch( fetchPlugins( [ selectedSiteId ] ) );
		}
	}, [ dispatch, selectedSiteId, siteDomain ] );

	/**
	 * As a general rule we allow fallback data to remain as static as possible.
	 * Therefore we should avoid relying on API responses to determine what is/isn't
	 * shown in the fallback data as then we have a situatoin where we are waiting on
	 * network requests to display fallback data when it should be possible to display
	 * without this. There are a couple of exceptions to this below where the menu items
	 * are sufficiently important to the UX that it is worth attempting the API request
	 * to determine whether or not the menu item should show in the fallback data.
	 */
	const shouldShowWooCommerce = useSelector(
		( state ) => !! getPluginOnSite( state, selectedSiteId, 'woocommerce' )?.active
	);
	const shouldShowThemes = useSelector( ( state ) =>
		canCurrentUser( state, selectedSiteId, 'edit_theme_options' )
	);

	/**
	 * When no site domain is provided, lets show only menu items that support all sites screens.
	 */
	if ( ! siteDomain ) {
		return allSitesMenu();
	}

	/**
	 * Overides for the static fallback data which will be displayed if/when there are
	 * no menu items in the API response or the API response has yet to be cached in
	 * browser storage APIs.
	 */
	const fallbackDataOverides = {
		siteDomain,
		shouldShowWooCommerce,
		shouldShowThemes,
	};

	return menuItems ?? buildFallbackResponse( fallbackDataOverides );
};

export default useSiteMenuItems;
