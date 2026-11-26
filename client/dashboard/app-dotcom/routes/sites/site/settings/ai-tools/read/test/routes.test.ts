/**
 * @vitest-environment jsdom
 */

import config from '@automattic/calypso-config';
import { screen } from '@testing-library/react';
import nock from 'nock';
import {
	mockPreferences,
	mockSite,
	mockSiteSettings,
	renderRoute,
	testSite,
} from '../../../../../../test-utils/render-route';
import '..';
import '../../../../../../../../sites/site';

describe( '/sites/$siteSlug/settings/ai-tools/read', () => {
	beforeEach( () => {
		config.enable( 'wordpress-ai-tools' );
		mockPreferences();
		mockSiteSettings();
		nock( 'https://public-api.wordpress.com' )
			.get( `/rest/v1.1/sites/${ testSite.ID }/big-sky-plugin` )
			.query( true )
			.reply( 200, {} );
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.1/me/settings' )
			.query( true )
			.reply( 200, {} );
	} );

	afterEach( () => {
		config.disable( 'wordpress-ai-tools' );
	} );

	test( 'renders', async () => {
		mockSite();

		await renderRoute( `/sites/${ testSite.slug }/settings/ai-tools/read` );

		expect( await screen.findByRole( 'heading', { name: 'Read' } ) ).toBeVisible();
	} );
} );
