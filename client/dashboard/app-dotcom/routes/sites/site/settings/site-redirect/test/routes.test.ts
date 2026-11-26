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

describe( '/sites/$siteSlug/settings/site-redirect', () => {
	beforeEach( () => {
		mockPreferences();
		mockSiteSettings();
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.1/products/' )
			.query( true )
			.reply( 200, {} );
		nock( 'https://public-api.wordpress.com' )
			.get( `/rest/v1.1/sites/${ testSite.ID }/domains/redirect` )
			.query( true )
			.reply( 200, {} );
	} );

	test( 'renders', async () => {
		mockSite();

		await renderRoute( `/sites/${ testSite.slug }/settings/site-redirect` );

		expect( await screen.findByRole( 'heading', { name: 'Site Redirect' } ) ).toBeVisible();
	} );
} );
