/**
 * @jest-environment jsdom
 */

import { APP_CONTEXT_DEFAULT_CONFIG, type AppConfig } from '../../context';
import { getRouter } from '../../router';
import { resolveOmnibarLinkNavigation } from '../omnibar-link-navigation';

const dashboardConfig: AppConfig = {
	...APP_CONTEXT_DEFAULT_CONFIG,
	basePath: '',
	supports: {
		...APP_CONTEXT_DEFAULT_CONFIG.supports,
		me: {
			billing: false,
			security: false,
			apps: false,
		},
	},
};

const router = getRouter( dashboardConfig );

describe( 'resolveOmnibarLinkNavigation', () => {
	test( 'navigates to a real in-app route', () => {
		expect( resolveOmnibarLinkNavigation( router, '/me/account' ) ).toEqual( {
			path: '/me/account',
		} );
	} );

	test( 'does not navigate for a path that only matches the 404 fallback route', () => {
		// The notifications bell renders `<a href="/notifications">` but toggles a
		// panel via its own click handler; intercepting it would render the 404 shell.
		expect( resolveOmnibarLinkNavigation( router, '/notifications' ) ).toBeNull();
	} );

	test( 'does not navigate for an external URL', () => {
		expect( resolveOmnibarLinkNavigation( router, 'https://wordpress.org/me/account' ) ).toBeNull();
	} );
} );
