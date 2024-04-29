import getSiteOption from './get-site-option';
import type { AppState } from 'calypso/types';

/**
 * Returns true if site has the nav redesign Global Site view enabled, false if it is not enabled.
 * @param  {Object}    state  Global state tree
 * @param  {?number}   siteId Site ID
 * @returns {?boolean}        Whether site has the nav redesign enabled
 */
export default function isGlobalSiteViewEnabled( state: AppState, siteId: number | null ) {
	const isAdminInterfaceWPAdmin =
		getSiteOption( state, siteId, 'wpcom_admin_interface' ) === 'wp-admin';

	return isAdminInterfaceWPAdmin;
}
