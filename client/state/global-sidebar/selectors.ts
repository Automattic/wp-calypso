import { isEnabled } from '@automattic/calypso-config';
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
];

function shouldShowGlobalSiteViewSection( siteId: number, sectionName: string ) {
	return (
		isEnabled( 'layout/dotcom-nav-redesign-v2' ) &&
		!! siteId &&
		GLOBAL_SITE_VIEW_SECTION_NAMES.includes( sectionName )
	);
}

export const getShouldShowGlobalSidebar = (
	_: AppState,
	siteId: number,
	sectionGroup: string,
	sectionName: string
) => {
	return (
		sectionGroup === 'me' ||
		sectionGroup === 'reader' ||
		sectionGroup === 'sites-dashboard' ||
		( sectionGroup === 'sites' &&
			( ! siteId || shouldShowGlobalSiteViewSection( siteId, sectionName ) ) )
	);
};

export const getShouldShowCollapsedGlobalSidebar = (
	state: AppState,
	siteId: number,
	sectionGroup: string,
	sectionName: string // eslint-disable-line @typescript-eslint/no-unused-vars
) => {
	// Global sidebar should be collapsed when in sites dashboard and a site is selected.
	return (
		isEnabled( 'layout/dotcom-nav-redesign-v2' ) && sectionGroup === 'sites-dashboard' && siteId
	);
};

export const getShouldShowGlobalSiteSidebar = (
	state: AppState,
	siteId: number,
	sectionGroup: string,
	sectionName: string
) => {
	return (
		isGlobalSiteViewEnabled( state, siteId ) &&
		sectionGroup === 'sites' &&
		shouldShowGlobalSiteViewSection( siteId, sectionName )
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
