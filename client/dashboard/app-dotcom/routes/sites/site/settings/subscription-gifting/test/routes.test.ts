/**
 * @vitest-environment jsdom
 */

import { screen } from '@testing-library/react';
import {
	mockPreferences,
	mockSite,
	mockSiteSettings,
	renderRoute,
	testSite,
} from '../../../../../test-utils/render-route';
import '..';
import '../../../layout';
import type { Site } from '@automattic/api-core';

describe( '/sites/$siteSlug/settings/subscription-gifting', () => {
	beforeEach( () => {
		mockPreferences();
		mockSiteSettings();
	} );

	test( 'renders', async () => {
		mockSite( {
			...testSite,
			plan: { features: { active: [ 'subscription-gifting' ] } },
		} as unknown as Site );

		await renderRoute( `/sites/${ testSite.slug }/settings/subscription-gifting` );

		expect(
			await screen.findByRole( 'heading', { name: 'Accept a gift subscription' } )
		).toBeVisible();
	} );
} );
