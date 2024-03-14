import { isEnabled } from '@automattic/calypso-config';
import { isGlobalSiteViewEnabled } from '../sites/selectors';
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
	// Global Site View should be limited to classic interface users only for now.
	return (
		isGlobalSiteViewEnabled( state, siteId ) &&
		( sectionGroup === 'sites' || sectionGroup === 'jetpack-cloud' ) &&
		!! siteId
	);
};
