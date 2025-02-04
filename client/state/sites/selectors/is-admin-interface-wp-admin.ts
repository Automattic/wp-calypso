import getSiteOption from './get-site-option';
import type { AppState } from 'calypso/types';

export default function isAdminInterfaceWPAdmin( state: AppState, siteId?: number | null ) {
	return getSiteOption( state, siteId, 'wpcom_admin_interface' ) === 'wp-admin';
}
