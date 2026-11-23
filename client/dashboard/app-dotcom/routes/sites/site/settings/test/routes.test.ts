/**
 * @vitest-environment jsdom
 */

import { screen } from '@testing-library/react';
import nock from 'nock';
import { mockPreferences, renderRoute } from '../../../../test-utils/render-route';
import type { Site, User } from '@automattic/api-core';

const user = { ID: 1 } as User;

const site = {
	ID: 1,
	name: 'Test Site',
	slug: 'test-site.wordpress.com',
	URL: 'https://test-site.wordpress.com',
	site_migration: {},
	capabilities: { manage_options: true },
	plan: { features: { active: [] } },
} as unknown as Site;

function mockSite( mockedSite: Site ) {
	nock( 'https://public-api.wordpress.com' )
		.persist()
		.get( `/rest/v1.1/sites/${ mockedSite.slug }` )
		.query( true )
		.reply( 200, mockedSite );
}

describe( '/sites/$siteSlug/settings', () => {
	beforeEach( () => {
		mockPreferences();
		nock( 'https://public-api.wordpress.com' )
			.persist()
			.get( `/rest/v1.4/sites/${ site.ID }/settings` )
			.query( true )
			.reply( 200, { settings: {} } );
	} );

	test( 'renders', async () => {
		mockSite( site );

		await renderRoute( `/sites/${ site.slug }/settings`, { user } );

		expect( await screen.findByRole( 'heading', { name: 'Settings' } ) ).toBeVisible();
		expect( screen.getByRole( 'heading', { name: 'General' } ) ).toBeVisible();
		expect( screen.getByRole( 'heading', { name: 'Server' } ) ).toBeVisible();
		expect( screen.getByRole( 'heading', { name: 'Security' } ) ).toBeVisible();
		expect( screen.getByRole( 'heading', { name: 'Danger zone' } ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: /Site visibility/ } ) ).toHaveTextContent( 'Public' );
	} );
} );
