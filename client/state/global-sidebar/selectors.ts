import { isPlansPageUntangled } from 'calypso/lib/plans/untangling-plans-experiment';
import {
	isScheduledUpdatesMultisiteCreateRoute,
	isScheduledUpdatesMultisiteEditRoute,
} from 'calypso/state/selectors/is-scheduled-updates-multisite-route';
import { isAdminInterfaceWPAdmin } from '../sites/selectors';
import type { AppState } from 'calypso/types';

export enum SidebarType {
	None = 'none',
	Global = 'global',
	GlobalCollapsed = 'global-collapsed',
	UnifiedSiteDefault = 'unified-site-default',
	UnifiedSiteClassic = 'unified-site-classic',
}

interface GetSidebarTypeParams {
	state: AppState;
	siteId: number | null;
	section: { group?: string };
	route: string;
}

export function getSidebarType( params: GetSidebarTypeParams ): SidebarType {
	const { state, siteId, section, route } = params;
	const { group } = section;

	if ( shouldShowSiteDashboard( params ) || shouldShowPluginDashboard( params ) ) {
		return SidebarType.GlobalCollapsed;
	}
	if (
		group === 'me' ||
		group === 'reader' ||
		group === 'sites-dashboard' ||
		( group === 'sites' && ! siteId ) ||
		( group === 'sites' && siteId && route === '/domains/manage' )
	) {
		return SidebarType.Global;
	}
	if ( group === 'sites' ) {
		return isAdminInterfaceWPAdmin( state, siteId )
			? SidebarType.UnifiedSiteClassic
			: SidebarType.UnifiedSiteDefault;
	}
	return SidebarType.None;
}

export function getShouldShowGlobalSidebar( params: GetSidebarTypeParams ) {
	const sidebarType = getSidebarType( params );
	return sidebarType === SidebarType.Global || sidebarType === SidebarType.GlobalCollapsed;
}

export function getShouldShowCollapsedGlobalSidebar( params: GetSidebarTypeParams ) {
	const sidebarType = getSidebarType( params );
	return sidebarType === SidebarType.GlobalCollapsed;
}

export function shouldShowSiteDashboard( { state, route }: GetSidebarTypeParams ) {
	return isInRoute( route, getSiteDashboardRoutes( state ) );
}

function shouldShowPluginDashboard( { route }: GetSidebarTypeParams ) {
	return (
		isScheduledUpdatesMultisiteCreateRoute( route ) || isScheduledUpdatesMultisiteEditRoute( route )
	);
}

// Calypso routes for which we show the Site Dashboard.
// Calypso routes not listed here will be shown in nav unification instead.
// See: pfsHM7-Dn-p2.
function getSiteDashboardRoutes( state: AppState ) {
	return [
		'/overview/',
		'/hosting-config/',
		'/github-deployments/',
		'/site-monitoring/',
		'/sites/performance/',
		'/site-logs/',
		'/hosting-features/',
		'/staging-site/',
		'/sites/settings',
		...( isPlansPageUntangled( state ) ? [ '/plans' ] : [] ),

		// Domain Management
		'/domains/manage/all/overview',
		'/domains/manage/all/email',
		'/domains/manage/all/contact-info',

		// Bulk Plugins management
		'/plugins/manage/sites',
	];
}

function isInRoute( route: string, routes: string[] ) {
	return routes.some( ( r ) => route?.startsWith( r ) );
}
