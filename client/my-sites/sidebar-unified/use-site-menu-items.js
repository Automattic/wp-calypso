/**
 * External dependencies
 */
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import buildFallbackResponse from './fallback-data.js';

/**
 * Internal dependencies
 */
import { requestAdminMenu } from '../../state/admin-menu/actions';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { getAdminMenu } from 'calypso/state/admin-menu/selectors';
import { getSiteDomain } from 'calypso/state/sites/selectors';

const useSiteMenuItems = () => {
	const dispatch = useDispatch();
	const selectedSiteId = useSelector( getSelectedSiteId );
	const siteDomain = useSelector( ( state ) => getSiteDomain( state, selectedSiteId ) );
	const menuItems = useSelector( ( state ) => getAdminMenu( state, selectedSiteId ) );

	useEffect( () => {
		if ( selectedSiteId !== null ) {
			dispatch( requestAdminMenu( selectedSiteId ) );
		}
	}, [ dispatch, selectedSiteId ] );

	/**
	 * To ensure that a menu is always available in the UI even
	 * if the network fails on an uncached request we provide a
	 * set of static fallback data to render a basic menu. This
	 * avoids a situation where the user might be left with an
	 * empty menu.
	 */
	return (
		menuItems ??
		buildFallbackResponse( {
			siteDomain,
		} )
	);
};

export default useSiteMenuItems;
