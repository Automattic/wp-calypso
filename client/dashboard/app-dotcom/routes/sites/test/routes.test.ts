/**
 * @vitest-environment jsdom
 */

import { screen } from '@testing-library/react';
import nock from 'nock';
import { mockPreferences, renderRoute } from '../../test-utils/render-route';
import '..';
import type { Site, User } from '@automattic/api-core';

const sites = [
	{
		ID: 1,
		name: 'My First Site',
		URL: 'https://my-first-site.wordpress.com',
		site_migration: {},
	} as Site,
	{
		ID: 2,
		name: 'My Second Site',
		URL: 'https://my-second-site.wordpress.com',
		site_migration: {},
	} as Site,
];

describe( '/sites', () => {
	beforeEach( () => {
		mockPreferences();
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.2/read/teams' )
			.query( true )
			.reply( 200, { teams: [] } );
	} );

	test( 'renders', async () => {
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.3/me/sites' )
			.query( true )
			.reply( 200, { sites } );

		await renderRoute( '/sites', { user: { site_count: 2 } as User } );

		expect( await screen.findByRole( 'heading', { name: 'Sites' } ) ).toBeVisible();
	} );
} );
