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

describe( '/sites/$siteSlug/settings/hundred-year-plan', () => {
	beforeEach( () => {
		mockPreferences();
		mockSiteSettings();
	} );

	test( 'renders', async () => {
		mockSite( {
			...testSite,
			plan: { features: { active: [ 'legacy-contact' ] } },
		} as unknown as Site );

		await renderRoute( `/sites/${ testSite.slug }/settings/hundred-year-plan` );

		expect( await screen.findByRole( 'heading', { name: 'Control your legacy' } ) ).toBeVisible();
	} );
} );
