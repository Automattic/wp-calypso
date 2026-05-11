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
	options?: {
		path?: string;
	};
	children?: RouteLike[];
};

function hasRoutePath( routes: RouteLike[], path: string ): boolean {
	return routes.some(
		( route ) =>
			route.options?.path === path ||
			route.path === path ||
			hasRoutePath( route.children ?? [], path )
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
