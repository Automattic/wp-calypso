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

describe( '/sites/$siteSlug/logs/php', () => {
	beforeEach( () => {
		mockPreferences();
		mockSiteSettings();
	} );

	test( 'renders', async () => {
		mockSite( {
			...testSite,
			plan: { features: { active: [ HostingFeatures.LOGS ] } },
		} as unknown as Site );

		await renderRoute( `/sites/${ testSite.slug }/logs/php` );

		expect( await screen.findByRole( 'heading', { name: 'PHP errors' } ) ).toBeVisible();
	} );
} );
