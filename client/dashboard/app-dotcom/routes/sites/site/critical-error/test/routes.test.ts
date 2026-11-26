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

describe( '/sites/$siteSlug/critical-error', () => {
	beforeEach( () => {
		mockPreferences();
	} );

	test( 'renders', async () => {
		mockSite( {
			...testSite,
			__inaccessible_jetpack_error: true,
			options: { jetpack_recovery_mode_status: { recovery_mode_email_last_sent: 100 } },
		} as unknown as Site );

		await renderRoute( `/sites/${ testSite.slug }/critical-error` );

		expect(
			await screen.findByRole( 'heading', { name: 'Your site cannot currently be reached' } )
		).toBeVisible();
	} );

	test( 'redirects to /sites/$siteSlug when the site’s Jetpack has no critical error', async () => {
		mockSite();

		const { router } = await renderRoute( `/sites/${ testSite.slug }/critical-error` );

		await waitFor( () =>
			expect( router.state.location.pathname ).toBe( `/sites/${ testSite.slug }` )
		);
	} );
} );
