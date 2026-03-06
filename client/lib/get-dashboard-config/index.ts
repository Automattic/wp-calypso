import type { DashboardType } from 'calypso/dashboard/app/types';

// You may want to extend this to match the shared interface for dotcom and ciab dashboard config shape.
export type DashboardConfig =
	| typeof import('./dotcom').config
	| typeof import('./ciab').config
	| typeof import('./dotcom-ciab').config;

let dashboardConfigPromise: Promise< DashboardConfig > | null = null;
let dashboardConfig: DashboardConfig | undefined;

export const DASHBOARD_TYPE: DashboardType | undefined =
	typeof window !== 'undefined' ? window.app?.dashboardType : undefined;

export async function fetchDashboardConfig() {
	if ( dashboardConfig ) {
		return dashboardConfig;
	}
	if ( dashboardConfigPromise ) {
		return dashboardConfigPromise;
	}

	if ( ! DASHBOARD_TYPE ) {
		return undefined;
	}

	switch ( DASHBOARD_TYPE ) {
		case 'dotcom':
			dashboardConfigPromise = import( './dotcom' ).then( ( d ) => {
				dashboardConfig = d.config;
				return dashboardConfig;
			} );
			break;
		case 'ciab':
			dashboardConfigPromise = import( './ciab' ).then( ( d ) => {
				dashboardConfig = d.config;
				return dashboardConfig;
			} );
			break;
		default: {
			const exhaustiveCheck: never = DASHBOARD_TYPE;
			return Promise.reject(
				new Error( `Exhaustive check failed: ${ exhaustiveCheck }. Please handle this case.` )
			);
		}
	}

	return dashboardConfigPromise;
}

/**
 * Get the dashboard config if it has already been fetched, otherwise undefined.
 * This does NOT trigger a load.
 */
export function getDashboardConfig() {
	return dashboardConfig;
}
