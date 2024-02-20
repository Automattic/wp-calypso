import { isEnabled } from '@automattic/calypso-config';
import { getSiteOption } from '../sites/selectors';
import type { AppState } from 'calypso/types';

export const getShouldShowGlobalSidebar = ( _: AppState, siteId: number, sectionGroup: string ) => {
	let shouldShowGlobalSidebar = false;
	if ( isEnabled( 'layout/dotcom-nav-redesign' ) ) {
		shouldShowGlobalSidebar =
			sectionGroup === 'me' ||
			sectionGroup === 'reader' ||
			sectionGroup === 'sites-dashboard' ||
			( sectionGroup === 'sites' && ! siteId );
	}
	return shouldShowGlobalSidebar;
};

export const getShouldShowGlobalSiteSidebar = (
	state: AppState,
	siteId: number,
	sectionGroup: string
) => {
	let shouldShowGlobalSiteSidebar = false;
	if ( isEnabled( 'layout/dotcom-nav-redesign' ) ) {
		// Global Site View should be limited to classic interface users only for now.
		const adminInterface = getSiteOption( state, siteId, 'wpcom_admin_interface' );
		shouldShowGlobalSiteSidebar =
			adminInterface === 'wp-admin' && sectionGroup === 'sites' && !! siteId;
	}
	return shouldShowGlobalSiteSidebar;
};
