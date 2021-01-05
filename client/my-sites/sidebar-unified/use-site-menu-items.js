/**
 * External dependencies
 */
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import buildFallbackResponse from './fallback-data.js';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { requestAdminMenu } from '../../state/admin-menu/actions';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { getAdminMenu } from 'calypso/state/admin-menu/selectors';
import { getSiteDomain } from 'calypso/state/sites/selectors';
import canCurrentUser from 'calypso/state/selectors/can-current-user';

import { getPluginOnSite } from 'calypso/state/plugins/installed/selectors';
import { fetchPlugins } from 'calypso/state/plugins/installed/actions';

const useSiteMenuItems = () => {
	const dispatch = useDispatch();
	const selectedSiteId = useSelector( getSelectedSiteId );
	const siteDomain = useSelector( ( state ) => getSiteDomain( state, selectedSiteId ) );
	const menuItems = useSelector( ( state ) => getAdminMenu( state, selectedSiteId ) );

	useEffect( () => {
		if ( selectedSiteId !== null ) {
			dispatch( requestAdminMenu( selectedSiteId ) );
			dispatch( fetchPlugins( [ selectedSiteId ] ) );
		}
	}, [ dispatch, selectedSiteId ] );

	/**
	 * To ensure that a menu is always available in the UI even
	 * if the network fails on an uncached request we provide a
	 * set of static fallback data to render a basic menu. This
	 * avoids a situation where the user might be left with an
	 * empty menu.
	 */

	const shouldShowLinks = true;
	const shouldShowTestimonials = useSelector( ( state ) =>
		get( state.siteSettings.items, [ selectedSiteId, 'jetpack_testimonial' ], false )
	);
	const shouldShowPortfolio = useSelector( ( state ) =>
		get( state.siteSettings.items, [ selectedSiteId, 'jetpack_portfolio' ], false )
	);
	const shouldShowWooCommerce = useSelector(
		( state ) => !! getPluginOnSite( state, selectedSiteId, 'woocommerce' )?.active
	);
	/*
	 * Header controlled by: current_theme_supports( 'custom-header' ) && current_user_can( 'customize' )
	 * Background controlled by: current_theme_supports( 'custom-background' ) && current_user_can( 'customize' )
	 * "What the theme supports" doesn't seem to be available in calypso most of the time?
	 * Example theme w/ these options: "Dara"
	 */
	const shouldShowThemes = useSelector( ( state ) =>
		canCurrentUser( state, selectedSiteId, 'edit_theme_options' )
	);
	const shouldShowApperanceHeaderAndBackground = true;

	const shouldShowAdControl = false;
	const shouldShowAMP = false;
	const fallbackOptions = {
		siteDomain,
		shouldShowLinks,
		shouldShowTestimonials,
		shouldShowPortfolio,
		shouldShowWooCommerce,
		shouldShowThemes,
		shouldShowApperanceHeaderAndBackground,
		shouldShowAdControl,
		shouldShowAMP,
	};
	return menuItems ?? buildFallbackResponse( fallbackOptions );
};

export default useSiteMenuItems;
