import { isEnabled } from '@automattic/calypso-config';
import { isWithinBreakpoint } from '@automattic/viewport';
import isScheduledUpdatesMultisiteRoute from 'calypso/state/selectors/is-scheduled-updates-multisite-route';
import { isGlobalSiteViewEnabled } from '../sites/selectors';
import type { AppState } from 'calypso/types';

// Calypso routes for which we show the Global Site Dashboard.
// Calypso routes not listed here will be shown in nav unification instead.
// See: pfsHM7-Dn-p2.
const GLOBAL_SITE_DASHBOARD_ROUTES: string[] = [
	'/overview/',
	'/hosting-config/',
	'/github-deployments/',
	'/site-monitoring/',
	'/dev-tools-promo/',
];

function isInRoute( state: AppState, routes: string[] ) {
	return routes.some( ( route ) => state.route.path?.current?.startsWith( route ) );
}

function shouldShowGlobalSiteDashboard( state: AppState, siteId: number | null ) {
	return (
		isEnabled( 'layout/dotcom-nav-redesign-v2' ) &&
		!! siteId &&
		isInRoute( state, GLOBAL_SITE_DASHBOARD_ROUTES )
	);
}

export const getShouldShowGlobalSiteSidebar = (
	state: AppState,
	siteId: number | null,
	sectionGroup: string
) => {
	return sectionGroup === 'sites' && shouldShowGlobalSiteDashboard( state, siteId );
};

export const getShouldShowGlobalSidebar = (
	state: AppState,
	siteId: number,
	sectionGroup: string
) => {
	const pluginsScheduledUpdates = isScheduledUpdatesMultisiteRoute( state );

	return (
		sectionGroup === 'me' ||
		sectionGroup === 'reader' ||
		sectionGroup === 'sites-dashboard' ||
		( sectionGroup === 'sites' && ! siteId ) ||
		( sectionGroup === 'sites' && pluginsScheduledUpdates ) ||
		getShouldShowGlobalSiteSidebar( state, siteId, sectionGroup )
	);
};

export const getShouldShowCollapsedGlobalSidebar = (
	state: AppState,
	siteId: number,
	sectionGroup: string
) => {
	if ( ! isEnabled( 'layout/dotcom-nav-redesign-v2' ) ) {
		return false;
	}

	const isSitesDashboard = sectionGroup === 'sites-dashboard';
	const isSiteDashboard = getShouldShowGlobalSiteSidebar( state, siteId, sectionGroup );

	// A site is just clicked and the global sidebar is in collapsing animation.
	const isSiteJustSelectedFromSitesDashboard =
		isSitesDashboard &&
		!! siteId &&
		isInRoute( state, [
			'/sites', // started collapsing when still in sites dashboard
			...GLOBAL_SITE_DASHBOARD_ROUTES, // has just stopped collapsing when in one of the paths in site dashboard
		] );

	const isPluginsScheduledUpdatesEditMode =
		! siteId &&
		isInRoute( state, [ '/plugins/scheduled-updates/edit', '/plugins/scheduled-updates/create' ] );

	const isBulkDomainsDashboard = isInRoute( state, [ '/domains/manage' ] );
	const isSmallScreenDashboard =
		( isSitesDashboard || isBulkDomainsDashboard ) && isWithinBreakpoint( '<782px' );

	return (
		isSiteJustSelectedFromSitesDashboard ||
		isSiteDashboard ||
		isPluginsScheduledUpdatesEditMode ||
		isSmallScreenDashboard
	);
};

export const getShouldShowUnifiedSiteSidebar = (
	state: AppState,
	siteId: number,
	sectionGroup: string
) => {
	return (
		isGlobalSiteViewEnabled( state, siteId ) &&
		sectionGroup === 'sites' &&
		! shouldShowGlobalSiteDashboard( state, siteId )
	);
};
