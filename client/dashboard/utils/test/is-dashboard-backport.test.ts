/**
 * @vitest-environment jsdom
 * @vitest-environment-options { "url": "https://container-test.calypso.live" }
 */

import { vi } from 'vitest';

test.each( [
	{ envId: 'dashboard-production', desktop: true, backport: false },
	{ envId: 'dashboard-horizon', desktop: true, backport: false },
	{ envId: 'wpcalypso', desktop: true, backport: true },
	{ envId: 'dashboard-horizon', desktop: false, backport: false },
	{ envId: 'wpcalypso', desktop: false, backport: true },
] )( 'classifies $envId with desktop=$desktop', async ( { envId, desktop, backport } ) => {
	vi.resetModules();
	window.configData = {
		env_id: envId,
		calypso_live_image: 'test-image',
		calypso_live_envs: { wpcom: 'calypso', dashboard: 'dashboard' },
	};
	window.electron = desktop ? {} : undefined;

	vi.doMock(
		'@automattic/calypso-config',
		() => import( '../../../../packages/calypso-config/src' )
	);
	const { default: config } = await import( '@automattic/calypso-config' );
	const { isDashboardBackport } = await import( '../is-dashboard-backport' );
	const { dashboardLinkWithBackport } = await import( '../link' );

	expect( config( 'env_id' ) ).toBe( desktop ? 'desktop' : envId );
	expect( isDashboardBackport() ).toBe( backport );
	expect( dashboardLinkWithBackport( '/sites' ) ).toBe(
		backport ? '/sites' : 'https://calypso.live/sites?image=test-image&env=dashboard'
	);
} );
