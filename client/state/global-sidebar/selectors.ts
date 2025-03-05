import isScheduledUpdatesMultisiteRoute, {
	isScheduledUpdatesMultisiteCreateRoute,
	isScheduledUpdatesMultisiteEditRoute,
} from 'calypso/state/selectors/is-scheduled-updates-multisite-route';
import { isAdminInterfaceWPAdmin } from '../sites/selectors';
import type { AppState } from 'calypso/types';

// Calypso routes for which we show the Site Dashboard.
// Calypso routes not listed here will be shown in nav unification instead.
// See: pfsHM7-Dn-p2.
const SITE_DASHBOARD_ROUTES = [
	'/overview/',
	'/hosting-config/',
	'/github-deployments/',
	'/site-monitoring/',
	'/sites/performance/',
	'/site-logs/',
	'/hosting-features/',
	'/staging-site/',

	// New Information Architecture
	'/sites/overview',
	'/sites/marketing',
	'/sites/settings',

	// Domain Management
	'/domains/manage/all/overview',
	'/domains/manage/all/email',
	'/domains/manage/all/contact-info',

	// Bulk Plugins management
	'/plugins/manage/sites',
];

function isInRoute( state: AppState, routes: string[] ) {
	return routes.some( ( route ) => state.route.path?.current?.startsWith( route ) );
}

function shouldShowSitesDashboard( state: AppState ) {
	return isInRoute( state, [ '/sites', '/p2s', '/setup', '/start', ...SITE_DASHBOARD_ROUTES ] );
}

export function shouldShowSiteDashboard( state: AppState, siteId: number | null ) {
	return !! siteId && isInRoute( state, [ '/setup', '/start', ...SITE_DASHBOARD_ROUTES ] );
}

export const getShouldShowGlobalSidebar = (
	state: AppState,
	siteId: number | null,
	sectionGroup: string
) => {
	const pluginsScheduledUpdates = isScheduledUpdatesMultisiteRoute( state );

	return (
		sectionGroup === 'me' ||
		sectionGroup === 'reader' ||
		( sectionGroup === 'sites-dashboard' && shouldShowSitesDashboard( state ) ) ||
		( sectionGroup === 'sites' && ! siteId ) ||
		( sectionGroup === 'sites' && pluginsScheduledUpdates ) ||
		( sectionGroup === 'sites' && shouldShowSiteDashboard( state, siteId ) )
	);
};

export const getShouldShowCollapsedGlobalSidebar = (
	state: AppState,
	siteId: number | null,
	sectionGroup: string
) => {
	const isSiteDashboard = sectionGroup === 'sites' && shouldShowSiteDashboard( state, siteId );

	const isPluginsScheduledUpdatesEditMode =
		isScheduledUpdatesMultisiteCreateRoute( state ) ||
		isScheduledUpdatesMultisiteEditRoute( state );

	const isPluginsManageSites = isInRoute( state, [ '/plugins/manage/sites/' ] );

	return isSiteDashboard || isPluginsScheduledUpdatesEditMode || isPluginsManageSites;
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
			! shouldShowSiteDashboard( state, siteId ) ) ||
		( isAdminInterfaceWPAdmin( state, siteId ) &&
			sectionName === 'plugins' &&
			! isScheduledUpdatesMultisiteRoute( state ) )
	);
};
