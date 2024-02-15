import { isEnabled } from '@automattic/calypso-config';

export const useGlobalSidebar = ( siteId, sectionGroup ) => {
	let shouldShowGlobalSidebar = false;
	let shouldShowGlobalSiteSidebar = false;
	if ( isEnabled( 'layout/dotcom-nav-redesign' ) ) {
		shouldShowGlobalSidebar =
			sectionGroup === 'me' ||
			sectionGroup === 'reader' ||
			sectionGroup === 'sites-dashboard' ||
			( sectionGroup === 'sites' && ! siteId );
		shouldShowGlobalSiteSidebar = sectionGroup === 'sites' && !! siteId;
	}
	return { shouldShowGlobalSidebar, shouldShowGlobalSiteSidebar };
};
