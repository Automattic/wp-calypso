/**
 * @vitest-environment jsdom
 */

import { screen, within } from '@testing-library/react';
import nock from 'nock';
import { mockPreferences, renderRoute } from '../../test-utils/render-route';
import type { Site, User } from '@automattic/api-core';

const mockSites = [
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
			.reply( 200, { sites: mockSites } );

		await renderRoute( '/sites', { user: { site_count: 2 } as User } );

		const list = await screen.findByRole( 'grid' );
		expect( within( list ).getByText( 'My First Site' ) ).toBeVisible();
		expect( within( list ).getByText( 'My Second Site' ) ).toBeVisible();
		expect( screen.getByRole( 'heading', { name: 'Sites' } ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Add new site' } ) ).toBeVisible();
		expect( screen.getByRole( 'searchbox' ) ).toBeVisible();
	} );
} );
