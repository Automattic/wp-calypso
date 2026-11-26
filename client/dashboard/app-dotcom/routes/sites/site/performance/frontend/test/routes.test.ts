/**
 * @vitest-environment jsdom
 */

import { HostingFeatures } from '@automattic/api-core';
import { screen } from '@testing-library/react';
import {
	mockPreferences,
	mockSite,
	mockSiteSettings,
	renderRoute,
	testSite,
} from '../../../../../test-utils/render-route';
import '..';
import '../../layout';
import '../../../layout';
import type { Site } from '@automattic/api-core';

describe( '/sites/$siteSlug/performance/frontend', () => {
	beforeEach( () => {
		mockPreferences();
		mockSiteSettings();
	} );

	test( 'renders', async () => {
		mockSite( {
			...testSite,
			plan: { features: { active: [ HostingFeatures.PERFORMANCE ] } },
		} as unknown as Site );

		await renderRoute( `/sites/${ testSite.slug }/performance/frontend` );

		expect( await screen.findByRole( 'heading', { name: 'Performance' } ) ).toBeVisible();
	} );
} );
