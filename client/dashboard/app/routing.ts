import { buildCiabDashboardLink, isAllowedCiabDashboardHostname } from '../app-ciab/routing';
import { buildDotcomDashboardLink, isAllowedDotcomDashboardHostname } from '../app-dotcom/routing';
import type { DashboardType } from './types';

export function isAllowedDashboardHostname( hostname?: string ): boolean {
	return isAllowedDotcomDashboardHostname( hostname ) || isAllowedCiabDashboardHostname( hostname );
}

export function getDashboardFromHostname( hostname?: string ): DashboardType | undefined {
	if ( isAllowedCiabDashboardHostname( hostname ) ) {
		return 'ciab';
	}
	if ( isAllowedDotcomDashboardHostname( hostname ) ) {
		return 'dotcom';
	}
	return undefined;
}

/**
 * Returns the current dashboard based on the current URL.
 * Used in dashboard environments.
 */
export function getCurrentDashboard(): DashboardType {
	return getDashboardFromHostname( window.location.hostname ) ?? 'dotcom';
}

/**
 * Returns the dashboard based on the URL query params.
 * Used in non-dashboard environments to know which dashboard the user came from.
 */
export function getDashboardFromQuery(): DashboardType | undefined {
	const params = new URLSearchParams( window.location.search );
	const dashboard = params.get( 'dashboard' );

	if ( dashboard === 'ciab' || dashboard === 'dotcom' ) {
		return dashboard;
	}
	return undefined;
}

/**
 * Builds a link for the specified dashboard.
 */
export function buildDashboardLink( dashboard: DashboardType, path: string = '' ) {
	if ( dashboard === 'ciab' ) {
		return buildCiabDashboardLink( path );
	}
	return buildDotcomDashboardLink( path );
}
