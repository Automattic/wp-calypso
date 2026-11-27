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

describe( '/sites/$siteSlug/settings/static-file-404', () => {
	beforeEach( () => {
		mockPreferences();
		mockSiteSettings();
	} );

	test( 'renders', async () => {
		mockSite();

		await renderRoute( `/sites/${ testSite.slug }/settings/static-file-404` );

		expect(
			await screen.findByRole( 'heading', { name: 'Handling requests for nonexistent assets' } )
		).toBeVisible();
	} );
} );
