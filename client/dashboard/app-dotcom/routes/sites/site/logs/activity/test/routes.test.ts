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
import '../..';
import '../../../../../../../sites/site';
import type { Site } from '@automattic/api-core';

describe( '/sites/$siteSlug/logs/activity', () => {
	beforeEach( () => {
		mockPreferences();
		mockSiteSettings();
	} );

	test( 'renders', async () => {
		mockSite( {
			...testSite,
			plan: { features: { active: [ HostingFeatures.ACTIVITY_LOG ] } },
		} as unknown as Site );

		await renderRoute( `/sites/${ testSite.slug }/logs/activity` );

		expect( await screen.findByRole( 'heading', { name: 'Activity' } ) ).toBeVisible();
	} );
} );
