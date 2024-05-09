import { isEnabled } from '@automattic/calypso-config';
import { isWithinBreakpoint } from '@automattic/viewport';
import { isGlobalSiteViewEnabled } from '../sites/selectors';
import type { AppState } from 'calypso/types';

// Calypso pages for which we show the Global Site View.
// Calypso pages not listed here will be shown in nav unification instead.
// See: pfsHM7-Dn-p2.
const GLOBAL_SITE_VIEW_SECTION_NAMES: string[] = [
	'hosting',
	'hosting-overview',
	'github-deployments',
	'site-monitoring',
	'dev-tools-promo',
];

function shouldShowGlobalSiteViewSection( siteId: number | null, sectionName: string ) {
	return (
		isEnabled( 'layout/dotcom-nav-redesign-v2' ) &&
		!! siteId &&
		GLOBAL_SITE_VIEW_SECTION_NAMES.includes( sectionName )
	);
}

export const getShouldShowGlobalSiteSidebar = (
	state: AppState,
	siteId: number | null,
	sectionGroup: string,
	sectionName: string
) => {
	return sectionGroup === 'sites' && shouldShowGlobalSiteViewSection( siteId, sectionName );
};

export const getShouldShowGlobalSidebar = (
	state: AppState,
	siteId: number,
	sectionGroup: string,
	sectionName: string
) => {
	return (
		sectionGroup === 'me' ||
		sectionGroup === 'reader' ||
		sectionGroup === 'sites-dashboard' ||
		( sectionGroup === 'sites' && ! siteId ) ||
		getShouldShowGlobalSiteSidebar( state, siteId, sectionGroup, sectionName )
	);
};

export const getShouldShowCollapsedGlobalSidebar = (
	state: AppState,
	siteId: number,
	sectionGroup: string,
	sectionName: string
) => {
	const isAllowedRegion = sectionGroup === 'sites-dashboard' || sectionGroup === 'sites';
	const siteSelected = sectionGroup === 'sites-dashboard' && !! siteId;
	const siteLoaded = getShouldShowGlobalSiteSidebar( state, siteId, sectionGroup, sectionName );

	return (
		isEnabled( 'layout/dotcom-nav-redesign-v2' ) &&
		isAllowedRegion &&
		( siteSelected || siteLoaded || isWithinBreakpoint( '<782px' ) )
	);
};

export const getShouldShowUnifiedSiteSidebar = (
	state: AppState,
	siteId: number,
	sectionGroup: string,
	sectionName: string
) => {
	return (
		isGlobalSiteViewEnabled( state, siteId ) &&
		sectionGroup === 'sites' &&
		! shouldShowGlobalSiteViewSection( siteId, sectionName )
	);
};
