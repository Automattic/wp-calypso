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

describe( '/sites/$siteSlug/settings/wordpress', () => {
	beforeEach( () => {
		mockPreferences();
		mockSiteSettings();
	} );

	test( 'renders', async () => {
		mockSite();

		await renderRoute( `/sites/${ testSite.slug }/settings/wordpress` );

		expect( await screen.findByRole( 'heading', { name: 'WordPress' } ) ).toBeVisible();
	} );
} );
