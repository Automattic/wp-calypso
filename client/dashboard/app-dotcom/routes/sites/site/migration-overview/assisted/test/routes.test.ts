/**
 * @vitest-environment jsdom
 */
import { screen, waitFor } from '@testing-library/react';
import {
	mockPreferences,
	mockSite,
	renderRoute,
	testSite,
} from '../../../../../test-utils/render-route';
import '..';
import '../..';
import '../../../layout';
import type { Site } from '@automattic/api-core';

describe( '/sites/$siteSlug/migration-overview/assisted', () => {
	beforeEach( () => {
		mockPreferences();
	} );

	test( 'renders', async () => {
		mockSite( {
			...testSite,
			site_migration: { type: 'wordpress', status_v2: 'pending' },
		} as unknown as Site );

		await renderRoute( `/sites/${ testSite.slug }/migration-overview/assisted` );

		expect(
			await screen.findByRole( 'heading', { name: 'Let our team migrate your site' } )
		).toBeVisible();
	} );

	test( 'redirects to /migration-overview when the migration is already with our team', async () => {
		mockSite( {
			...testSite,
			site_migration: { type: 'assisted-wordpress', status_v2: 'pending' },
		} as unknown as Site );

		const { router } = await renderRoute( `/sites/${ testSite.slug }/migration-overview/assisted` );

		await waitFor( () =>
			expect( router.state.location.pathname ).toBe(
				`/sites/${ testSite.slug }/migration-overview`
			)
		);
	} );
} );
