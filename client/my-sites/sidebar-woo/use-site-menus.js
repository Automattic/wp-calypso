import { useLocale } from '@automattic/i18n-utils';
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getSiteDomain } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { getWooAdminMenu } from 'calypso/state/woo-admin-menu/selectors';
import { requestWooAdminMenu } from '../../state/woo-admin-menu/actions';

const useSiteMenus = () => {
	const dispatch = useDispatch();
	const selectedSiteId = useSelector( getSelectedSiteId );
	const siteDomain = useSelector( ( state ) => getSiteDomain( state, selectedSiteId ) );
	const menus = useSelector( ( state ) => getWooAdminMenu( state, selectedSiteId ) );
	const locale = useLocale();

	useEffect( () => {
		if ( selectedSiteId && siteDomain ) {
			dispatch( requestWooAdminMenu( selectedSiteId ) );
		}
	}, [ dispatch, selectedSiteId, siteDomain, locale ] );

	return menus;
};

export default useSiteMenus;
