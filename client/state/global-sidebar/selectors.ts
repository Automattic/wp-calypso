import { isEnabled } from '@automattic/calypso-config';
import { isGlobalSiteViewEnabled } from '../sites/selectors';
import type { AppState } from 'calypso/types';

export const getShouldShowGlobalSidebar = ( _: AppState, siteId: number, sectionGroup: string ) => {
	return (
		sectionGroup === 'me' ||
		sectionGroup === 'reader' ||
		sectionGroup === 'sites-dashboard' ||
		( sectionGroup === 'sites' && ! siteId )
	);
};

export const getShouldShowCollapsedGlobalSidebar = (
	state: AppState,
	siteId: number,
	sectionGroup: string
) => {
	// Global Site View should be limited to classic interface users with layout/dotcom-nav-redesign-v2 feature flag enabled for now.
	return (
		isEnabled( 'layout/dotcom-nav-redesign-v2' ) &&
		isGlobalSiteViewEnabled( state, siteId ) &&
		sectionGroup === 'sites' &&
		!! siteId
	);
};

export const getShouldShowGlobalSiteSidebar = (
	state: AppState,
	siteId: number,
	sectionGroup: string
) => {
	// Global Site View should be limited to classic interface users only for now.
	return isGlobalSiteViewEnabled( state, siteId ) && sectionGroup === 'sites' && !! siteId;
};
