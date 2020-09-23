/**
 * External dependencies
 */
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestAdminMenu } from '../../state/admin-menu/actions';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getAdminMenu } from 'state/admin-menu/selectors';

const useSiteMenuItems = () => {
	const dispatch = useDispatch();
	const selectedSiteId = useSelector( getSelectedSiteId );

	const menuItems = useSelector( ( state ) => getAdminMenu( state, selectedSiteId ) );

	useEffect( () => {
		if ( selectedSiteId !== null ) {
			dispatch( requestAdminMenu( selectedSiteId ) );
		}
	}, [ dispatch, selectedSiteId ] );

	// Selector may return `null` so add sensible default
	return menuItems ?? [];
};

export default useSiteMenuItems;
