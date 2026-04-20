import {
	buildCiabDashboardLink,
	isAllowedCiabDashboardHostname,
	isAllowedCiabLegacyRoute,
} from '../app-ciab/routing';
import { buildDotcomDashboardLink, isAllowedDotcomDashboardHostname } from '../app-dotcom/routing';
import type { DashboardType } from './types';

/**
 * Checks if the given route is allowed on the requesting dashboard hostname.
 * All routes are allowed on dotcom. On CIAB, route policy is delegated to
 * the CIAB routing module.
 */
export function isAllowedDashboardRoute( {
	hostname,
	path,
}: {
	hostname?: string;
	path?: string;
} ): boolean {
	if ( isAllowedDotcomDashboardHostname( hostname ) ) {
		return true;
	}

	if ( isAllowedCiabDashboardHostname( hostname ) ) {
		return isAllowedCiabLegacyRoute( path );
	}

	return false;
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
