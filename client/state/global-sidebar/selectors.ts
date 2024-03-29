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

export const getShouldShowGlobalSiteSidebar = (
	state: AppState,
	siteId: number,
	sectionGroup: string
) => {
	// Global Site View should be limited to classic interface users only for now.
	return isGlobalSiteViewEnabled( state, siteId ) && sectionGroup === 'sites' && !! siteId;
};
