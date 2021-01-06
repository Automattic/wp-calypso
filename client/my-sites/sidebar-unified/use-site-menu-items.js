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

	const shouldShowTestimonials = useSelector( ( state ) =>
		get( state.siteSettings.items, [ selectedSiteId, 'jetpack_testimonial' ], false )
	);
	const shouldShowPortfolio = useSelector( ( state ) =>
		get( state.siteSettings.items, [ selectedSiteId, 'jetpack_portfolio' ], false )
	);
	const shouldShowWooCommerce = useSelector(
		( state ) => !! getPluginOnSite( state, selectedSiteId, 'woocommerce' )?.active
	);
	const shouldShowThemes = useSelector( ( state ) =>
		canCurrentUser( state, selectedSiteId, 'edit_theme_options' )
	);

	const fallbackOptions = {
		siteDomain,
		shouldShowTestimonials,
		shouldShowPortfolio,
		shouldShowWooCommerce,
		shouldShowThemes,
	};

	return menuItems ?? buildFallbackResponse( fallbackOptions );
};

export default useSiteMenuItems;
