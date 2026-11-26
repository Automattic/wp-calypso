/**
 * @vitest-environment jsdom
 */

import { screen } from '@testing-library/react';
import nock from 'nock';
import {
	mockPreferences,
	mockSite,
	mockSiteSettings,
	renderRoute,
	testSite,
} from '../../../../../test-utils/render-route';
import '..';
import '../../../../../../../sites/site';

describe( '/sites/$siteSlug/settings/site-visibility', () => {
	beforeEach( () => {
		mockPreferences();
		mockSiteSettings();
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.2/all-domains' )
			.query( true )
			.reply( 200, { domains: [] } );
	} );

	test( 'renders', async () => {
		mockSite();

		await renderRoute( `/sites/${ testSite.slug }/settings/site-visibility` );

		expect( await screen.findByRole( 'heading', { name: 'Site visibility' } ) ).toBeVisible();
	} );
} );
