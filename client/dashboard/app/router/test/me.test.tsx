/**
 * @jest-environment jsdom
 */

import { isDashboardBackport } from '../../../utils/is-dashboard-backport';
import { APP_CONTEXT_DEFAULT_CONFIG, type AppConfig } from '../../context';
import { createMeRoutes } from '../me';

jest.mock( '../../../utils/is-dashboard-backport', () => ( {
	isDashboardBackport: jest.fn( () => false ),
} ) );

const mockIsDashboardBackport = jest.mocked( isDashboardBackport );

const dashboardConfig: AppConfig = {
	...APP_CONTEXT_DEFAULT_CONFIG,
	supports: {
		...APP_CONTEXT_DEFAULT_CONFIG.supports,
		me: {
			billing: false,
			security: false,
			apps: false,
		},
		colorScheme: true,
		darkMode: true,
	},
};

type RouteLike = {
	path?: string;
	options?: unknown;
	children?: unknown[];
};

function getRouteOptionsPath( route: RouteLike ): string | undefined {
	if (
		route.options &&
		typeof route.options === 'object' &&
		'path' in route.options &&
		typeof route.options.path === 'string'
	) {
		return route.options.path;
	}
}

function getRouteChildren( route: unknown ): unknown[] {
	if ( ! route || typeof route !== 'object' || ! ( 'children' in route ) ) {
		return [];
	}

	return Array.isArray( route.children ) ? route.children : [];
}

function hasRoutePath( routes: unknown[], path: string ): boolean {
	return routes.some(
		( route ) =>
			typeof route === 'object' &&
			route !== null &&
			( getRouteOptionsPath( route ) === path ||
				( 'path' in route && route.path === path ) ||
				( 'children' in route && hasRoutePath( getRouteChildren( route ), path ) ) )
	);
}

beforeEach( () => {
	mockIsDashboardBackport.mockReturnValue( false );
} );

test( 'registers the appearance route in the Dashboard backport so deep links can redirect', () => {
	mockIsDashboardBackport.mockReturnValue( true );

	expect( hasRoutePath( createMeRoutes( dashboardConfig ), 'appearance' ) ).toBe( true );
} );

test( 'does not register the appearance route when dark mode is not supported', () => {
	expect(
		hasRoutePath(
			createMeRoutes( {
				...dashboardConfig,
				supports: {
					...dashboardConfig.supports,
					darkMode: false,
				},
			} ),
			'appearance'
		)
	).toBe( false );
} );

test( 'does not register the appearance route when color scheme is not supported', () => {
	expect(
		hasRoutePath(
			createMeRoutes( {
				...dashboardConfig,
				supports: {
					...dashboardConfig.supports,
					colorScheme: false,
					darkMode: true,
				},
			} ),
			'appearance'
		)
	).toBe( false );
} );
