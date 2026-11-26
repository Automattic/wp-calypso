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
} from '../../../../test-utils/render-route';
import '..';
import '../../layout';
import type { Site } from '@automattic/api-core';

describe( '/sites/$siteSlug/monitoring', () => {
	beforeEach( () => {
		mockPreferences();
		mockSiteSettings();
	} );

	test( 'renders', async () => {
		mockSite( {
			...testSite,
			plan: { features: { active: [ HostingFeatures.MONITOR ] } },
		} as unknown as Site );

		await renderRoute( `/sites/${ testSite.slug }/monitoring` );

		expect( await screen.findByRole( 'heading', { name: 'Monitoring' } ) ).toBeVisible();
	} );
} );
