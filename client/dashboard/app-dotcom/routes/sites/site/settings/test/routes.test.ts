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
} from '../../../../test-utils/render-route';
import '..';
import '../../layout';

describe( '/sites/$siteSlug/settings', () => {
	beforeEach( () => {
		mockPreferences();
		mockSiteSettings();
	} );

	test( 'renders', async () => {
		mockSite();

		await renderRoute( `/sites/${ testSite.slug }/settings` );

		expect( await screen.findByRole( 'heading', { name: 'Settings' } ) ).toBeVisible();
		expect( screen.getByRole( 'heading', { name: 'General' } ) ).toBeVisible();
		expect( screen.getByRole( 'heading', { name: 'Server' } ) ).toBeVisible();
		expect( screen.getByRole( 'heading', { name: 'Security' } ) ).toBeVisible();
		expect( screen.getByRole( 'heading', { name: 'Danger zone' } ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: /Site visibility/ } ) ).toHaveTextContent( 'Public' );
	} );
} );
