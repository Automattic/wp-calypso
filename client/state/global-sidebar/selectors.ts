import { isWithinBreakpoint } from '@automattic/viewport';
import isScheduledUpdatesMultisiteRoute, {
	isScheduledUpdatesMultisiteCreateRoute,
	isScheduledUpdatesMultisiteEditRoute,
} from 'calypso/state/selectors/is-scheduled-updates-multisite-route';
import { isGlobalSiteViewEnabled } from '../sites/selectors';
import type { AppState } from 'calypso/types';

// Calypso pages (section name => route) for which we show the Global Site Dashboard.
// Calypso pages not listed here will be shown in nav unification instead.
// See: pfsHM7-Dn-p2.
const GLOBAL_SITE_DASHBOARD_ROUTES = {
	'hosting-overview': '/overview/',
	hosting: '/hosting-config/',
	'github-deployments': '/github-deployments/',
	'site-monitoring': '/site-monitoring/',
	'site-logs': '/site-logs/',
	'hosting-features': '/hosting-features/',
	'staging-site': '/staging-site',
};

function isInSection( sectionName: string, sectionNames: string[] ) {
	return sectionNames.includes( sectionName );
}

function isInRoute( state: AppState, routes: string[] ) {
	return routes.some( ( route ) => state.route.path?.current?.startsWith( route ) );
}

function shouldShowGlobalSiteDashboard(
	state: AppState,
	siteId: number | null,
	sectionName: string
) {
	return (
		!! siteId &&
		( isInSection( sectionName, Object.keys( GLOBAL_SITE_DASHBOARD_ROUTES ) ) ||
			isInRoute( state, Object.values( GLOBAL_SITE_DASHBOARD_ROUTES ) ) )
	);
}

export const getShouldShowGlobalSiteSidebar = (
	state: AppState,
	siteId: number | null,
	sectionGroup: string,
	sectionName: string
) => {
	return sectionGroup === 'sites' && shouldShowGlobalSiteDashboard( state, siteId, sectionName );
};

export const getShouldShowGlobalSidebar = (
	state: AppState,
	siteId: number,
	sectionGroup: string,
	sectionName: string
) => {
	const pluginsScheduledUpdates = isScheduledUpdatesMultisiteRoute( state );

	return (
		sectionGroup === 'me' ||
		sectionGroup === 'reader' ||
		sectionGroup === 'sites-dashboard' ||
		( sectionGroup === 'sites' && ! siteId ) ||
		( sectionGroup === 'sites' && pluginsScheduledUpdates ) ||
		getShouldShowGlobalSiteSidebar( state, siteId, sectionGroup, sectionName )
	);
};

export const getShouldShowCollapsedGlobalSidebar = (
	state: AppState,
	siteId: number,
	sectionGroup: string,
	sectionName: string
) => {
	const isSitesDashboard = sectionGroup === 'sites-dashboard';
	const isSiteDashboard = getShouldShowGlobalSiteSidebar(
		state,
		siteId,
		sectionGroup,
		sectionName
	);

	// A site is just clicked and the global sidebar is in collapsing animation.
	const isSiteJustSelectedFromSitesDashboard =
		isSitesDashboard &&
		!! siteId &&
		isInRoute( state, [
			'/sites', // started collapsing when still in sites dashboard
			...Object.values( GLOBAL_SITE_DASHBOARD_ROUTES ), // has just stopped collapsing when in one of the paths in site dashboard
		] );

	const isPluginsScheduledUpdatesEditMode =
		isScheduledUpdatesMultisiteCreateRoute( state ) ||
		isScheduledUpdatesMultisiteEditRoute( state );

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
	sectionGroup: string,
	sectionName: string
) => {
	return (
		( isGlobalSiteViewEnabled( state, siteId ) &&
			sectionGroup === 'sites' &&
			sectionName !== 'plugins' &&
			! shouldShowGlobalSiteDashboard( state, siteId, sectionName ) ) ||
		( isGlobalSiteViewEnabled( state, siteId ) &&
			sectionName === 'plugins' &&
			! isScheduledUpdatesMultisiteRoute( state ) )
	);
};
