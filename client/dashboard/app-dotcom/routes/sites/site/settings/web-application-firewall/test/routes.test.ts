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

describe( '/sites/$siteSlug/settings/web-application-firewall', () => {
	beforeEach( () => {
		mockPreferences();
		mockSiteSettings();
	} );

	test( 'renders', async () => {
		mockSite();

		await renderRoute( `/sites/${ testSite.slug }/settings/web-application-firewall` );

		expect(
			await screen.findByRole( 'heading', { name: 'Web Application Firewall (WAF)' } )
		).toBeVisible();
	} );
} );
