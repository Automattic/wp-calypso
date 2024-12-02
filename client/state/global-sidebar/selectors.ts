import isScheduledUpdatesMultisiteRoute, {
	isScheduledUpdatesMultisiteCreateRoute,
	isScheduledUpdatesMultisiteEditRoute,
} from 'calypso/state/selectors/is-scheduled-updates-multisite-route';
import { isAdminInterfaceWPAdmin } from '../sites/selectors';
import type { AppState } from 'calypso/types';

// Calypso pages (section name => route) for which we show the Site Dashboard.
// Calypso pages not listed here will be shown in nav unification instead.
// See: pfsHM7-Dn-p2.
const SITE_DASHBOARD_ROUTES = {
	'hosting-overview': '/overview/',
	hosting: '/hosting-config/',
	'github-deployments': '/github-deployments/',
	'site-monitoring': '/site-monitoring/',
	'site-performance': '/sites/performance/',
	'site-logs': '/site-logs/',
	'hosting-features': '/hosting-features/',
	'staging-site': '/staging-site/',

	// New Information Architecture
	'site-overview': '/sites/overview',
	'site-marketing': '/sites/marketing',
	'site-tools': '/sites/tools',
	'site-settings': '/sites/settings',

	// Domain Management
	'all-domain-management': '/domains/all/manage',
	'all-email-management': '/domains/all/email',
};

function isInSection( sectionName: string, sectionNames: string[] ) {
	return sectionNames.includes( sectionName );
}

function isInRoute( state: AppState, routes: string[] ) {
	return routes.some( ( route ) => state.route.path?.current?.startsWith( route ) );
}

function shouldShowSiteDashboard( state: AppState, siteId: number | null, sectionName: string ) {
	return (
		!! siteId &&
		( isInSection( sectionName, Object.keys( SITE_DASHBOARD_ROUTES ) ) ||
			isInRoute( state, Object.values( SITE_DASHBOARD_ROUTES ) ) )
	);
}

export const getShouldShowSiteDashboard = (
	state: AppState,
	siteId: number | null,
	sectionGroup: string,
	sectionName: string
) => {
	return sectionGroup === 'sites' && shouldShowSiteDashboard( state, siteId, sectionName );
};

export const getShouldShowGlobalSidebar = (
	state: AppState,
	siteId: number | null,
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
		getShouldShowSiteDashboard( state, siteId, sectionGroup, sectionName )
	);
};

export const getShouldShowCollapsedGlobalSidebar = (
	state: AppState,
	siteId: number | null,
	sectionGroup: string,
	sectionName: string
) => {
	const isSitesDashboard = sectionGroup === 'sites-dashboard';
	const isSiteDashboard = getShouldShowSiteDashboard( state, siteId, sectionGroup, sectionName );

	// A site is just clicked and the global sidebar is in collapsing animation.
	const isSiteJustSelectedFromSitesDashboard =
		isSitesDashboard &&
		!! siteId &&
		isInRoute( state, [
			'/sites', // started collapsing when still in sites dashboard
			...Object.values( SITE_DASHBOARD_ROUTES ), // has just stopped collapsing when in one of the paths in site dashboard
		] );

	const isPluginsScheduledUpdatesEditMode =
		isScheduledUpdatesMultisiteCreateRoute( state ) ||
		isScheduledUpdatesMultisiteEditRoute( state );

	return (
		isSiteJustSelectedFromSitesDashboard || isSiteDashboard || isPluginsScheduledUpdatesEditMode
	);
};

export const getShouldShowUnifiedSiteSidebar = (
	state: AppState,
	siteId: number,
	sectionGroup: string,
	sectionName: string
) => {
	return (
		( isAdminInterfaceWPAdmin( state, siteId ) &&
			sectionGroup === 'sites' &&
			sectionName !== 'plugins' &&
			! shouldShowSiteDashboard( state, siteId, sectionName ) ) ||
		( isAdminInterfaceWPAdmin( state, siteId ) &&
			sectionName === 'plugins' &&
			! isScheduledUpdatesMultisiteRoute( state ) )
	);
};
