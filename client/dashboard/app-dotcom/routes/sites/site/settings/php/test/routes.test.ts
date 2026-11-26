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
import '../../../../../../../sites/site';

describe( '/sites/$siteSlug/settings/php', () => {
	beforeEach( () => {
		mockPreferences();
		mockSiteSettings();
	} );

	test( 'renders', async () => {
		mockSite();

		await renderRoute( `/sites/${ testSite.slug }/settings/php` );

		expect( await screen.findByRole( 'heading', { name: 'PHP' } ) ).toBeVisible();
	} );
} );
