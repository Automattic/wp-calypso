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
	'site-logs': '/site-logs/',
	'hosting-features': '/hosting-features/',
	'staging-site': '/staging-site/',
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
		getShouldShowSiteDashboard( state, siteId, sectionGroup, sectionName )
	);
};

interface CollapsedDataHelper {
	shouldShowForAnimation: boolean;
	selectedSiteId: number | null | undefined;
	sectionGroup: string;
}

const collapsedDataHelper: CollapsedDataHelper = {
	shouldShowForAnimation: false,
	selectedSiteId: null,
	sectionGroup: '',
};

export const getShouldShowCollapsedGlobalSidebar = (
	state: AppState,
	siteId: number | null,
	sectionGroup: string,
	sectionName: string
) => {
	const isSitesDashboard = sectionGroup === 'sites-dashboard';
	const isSiteDashboard = getShouldShowSiteDashboard( state, siteId, sectionGroup, sectionName );

	if ( collapsedDataHelper.sectionGroup !== sectionGroup ) {
		if ( isSitesDashboard ) {
			// Set or refresh the initial value when loading into the dashboard.
			collapsedDataHelper.selectedSiteId = siteId;
		} else {
			// Clear this once we are off the sites dashboard.
			collapsedDataHelper.shouldShowForAnimation = false;
		}
		// Keep track of section group to evaluate things when this changes.
		collapsedDataHelper.sectionGroup = sectionGroup;
	}

	// When selected site changes on the dashboard, show for animation.
	if (
		isSitesDashboard &&
		!! siteId &&
		collapsedDataHelper.selectedSiteId !== siteId &&
		! collapsedDataHelper.shouldShowForAnimation
	) {
		collapsedDataHelper.shouldShowForAnimation = true;
		collapsedDataHelper.selectedSiteId = siteId;
	}

	const isPluginsScheduledUpdatesEditMode =
		isScheduledUpdatesMultisiteCreateRoute( state ) ||
		isScheduledUpdatesMultisiteEditRoute( state );

	return (
		collapsedDataHelper.shouldShowForAnimation ||
		isSiteDashboard ||
		isPluginsScheduledUpdatesEditMode
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
