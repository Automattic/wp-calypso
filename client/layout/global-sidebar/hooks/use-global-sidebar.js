import { isEnabled } from '@automattic/calypso-config';

export const useGlobalSidebar = ( siteId, sectionGroup ) => {
	let shouldShowGlobalSidebar = false;
	if ( isEnabled( 'layout/dotcom-nav-redesign' ) ) {
		shouldShowGlobalSidebar =
			sectionGroup === 'me' ||
			sectionGroup === 'reader' ||
			sectionGroup === 'sites-dashboard' ||
			( sectionGroup === 'sites' && ! siteId ) ||
			sectionGroup === 'sites';
	}

	return { shouldShowGlobalSidebar };
};
