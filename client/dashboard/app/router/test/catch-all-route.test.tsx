/**
 * @jest-environment jsdom
 */

import { APP_CONTEXT_DEFAULT_CONFIG, type AppConfig } from '../../context';
import { getRouter } from '../index';

const dashboardConfig: AppConfig = {
	...APP_CONTEXT_DEFAULT_CONFIG,
	supports: {
		...APP_CONTEXT_DEFAULT_CONFIG.supports,
		me: {
			billing: false,
			security: false,
			apps: false,
		},
	},
};

function matchFallback( pathname: string ): boolean | undefined {
	const router = getRouter( dashboardConfig );
	const parsedLocation = router.parseLocation( undefined, {
		pathname,
		search: '',
		hash: '',
		href: pathname,
		state: { __TSR_index: 0 },
	} );
	const { foundRoute } = router.getMatchedRoutes( parsedLocation );
	return foundRoute?.options.staticData?.isFallbackNotFoundRoute;
}

describe( 'Dashboard catch-all route', () => {
	test( 'flags an unknown path (e.g. /notifications) as the fallback not-found route', () => {
		expect( matchFallback( '/notifications' ) ).toBe( true );
	} );

	test( 'does not flag a real route (e.g. /me/account) as the fallback not-found route', () => {
		expect( matchFallback( '/me/account' ) ).toBeFalsy();
	} );
} );
