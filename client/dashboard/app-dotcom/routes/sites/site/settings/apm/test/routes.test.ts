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
} from '../../../../../test-utils/render-route';
import '..';
import '../../../layout';

describe( '/sites/$siteSlug/settings/apm', () => {
	beforeEach( () => {
		config.enable( 'performance/apm' );
		mockPreferences();
		mockSiteSettings();
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.2/read/teams' )
			.query( true )
			.reply( 200, { teams: [ { slug: 'a8c' } ] } );
	} );

	afterEach( () => {
		config.disable( 'performance/apm' );
	} );

	test( 'renders', async () => {
		mockSite();

		await renderRoute( `/sites/${ testSite.slug }/settings/apm` );

		expect(
			await screen.findByRole( 'heading', { name: 'Application Performance Monitoring' } )
		).toBeVisible();
	} );
} );
