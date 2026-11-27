/**
 * @vitest-environment jsdom
 */
import { screen, waitFor } from '@testing-library/react';
import {
	mockPreferences,
	mockSite,
	renderRoute,
	testSite,
} from '../../../../test-utils/render-route';
import '..';
import '../..';
import '../../layout';
import type { Site } from '@automattic/api-core';

describe( '/sites/$siteSlug/migration-overview', () => {
	beforeEach( () => {
		mockPreferences();
	} );

	test( 'renders', async () => {
		mockSite( {
			...testSite,
			site_migration: { migration_status: 'migration-started-diy' },
		} as unknown as Site );

		await renderRoute( `/sites/${ testSite.slug }/migration-overview` );

		expect(
			await screen.findByRole( 'heading', { name: 'Your migration is underway' } )
		).toBeVisible();
	} );

	test( 'redirects to /sites/$siteSlug when the site isn’t being migrated', async () => {
		mockSite();

		const { router } = await renderRoute( `/sites/${ testSite.slug }/migration-overview` );

		await waitFor( () =>
			expect( router.state.location.pathname ).toBe( `/sites/${ testSite.slug }` )
		);
	} );
} );
