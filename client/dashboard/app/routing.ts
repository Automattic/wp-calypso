import { buildA4ADashboardLink, isAllowedA4ADashboardHostname } from '../app-a4a/routing';
import { buildDotcomDashboardLink, isAllowedDotcomDashboardHostname } from '../app-dotcom/routing';
import type { DashboardType } from './types';

export function getDashboardFromHostname( hostname?: string ): DashboardType | undefined {
	if ( isAllowedDotcomDashboardHostname( hostname ) ) {
		return 'dotcom';
	}
	if ( isAllowedA4ADashboardHostname( hostname ) ) {
		return 'a4a';
	}
	return undefined;
}

/**
 * Returns the current dashboard based on the current URL.
 * Used in dashboard environments.
 */
export function getCurrentDashboard(): DashboardType {
	if ( typeof window === 'undefined' ) {
		return 'dotcom';
	}
	return getDashboardFromHostname( window.location.hostname ) ?? 'dotcom';
}

/**
 * Returns the dashboard based on the URL query params.
 * Used in non-dashboard environments to know which dashboard the user came from.
 */
export function getDashboardFromQuery(): DashboardType | undefined {
	if ( typeof window === 'undefined' ) {
		return undefined;
	}
	const params = new URLSearchParams( window.location.search );
	const dashboard = params.get( 'dashboard' );

	if ( dashboard === 'a4a' || dashboard === 'dotcom' ) {
		return dashboard;
	}
	return undefined;
}

/**
 * Builds a link for the specified dashboard.
 */
export function buildDashboardLink( dashboard: DashboardType, path: string = '' ) {
	if ( dashboard === 'a4a' ) {
		return buildA4ADashboardLink( path );
	}
	return buildDotcomDashboardLink( path );
}
