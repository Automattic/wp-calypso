import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'calypso/state';
import getSiteAdminUrl from '../selectors/get-site-admin-url';
import getSiteHomeUrl from '../selectors/get-site-home-url';
import getSiteOption from '../selectors/get-site-option';
import type { AppState } from 'calypso/types';

/**
 * Returns the site admin interface data
 */
const useSiteAdminInterfaceData = ( siteId: string | number = 0 ) => {
	const translate = useTranslate();
	const wpcomAdminInterface = useSelector( ( state: AppState ) =>
		getSiteOption( state, siteId, 'wpcom_admin_interface' )
	);
	const isWPAdmin = wpcomAdminInterface === 'wp-admin';
	const adminLabel = isWPAdmin ? translate( 'WP Admin' ) : translate( 'My Home' );
	const adminUrl =
		useSelector( ( state: AppState ) =>
			isWPAdmin ? getSiteAdminUrl( state, siteId ) : getSiteHomeUrl( state, siteId )
		) ?? '';

	return {
		wpcomAdminInterface,
		isWPAdmin,
		adminLabel,
		adminUrl,
	};
};

export default useSiteAdminInterfaceData;
