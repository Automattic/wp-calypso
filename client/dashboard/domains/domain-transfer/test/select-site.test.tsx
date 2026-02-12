/**
 * @jest-environment jsdom
 */
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../test-utils';
import { SelectSite } from '../select-site';
import type { Site } from '@automattic/api-core';

const mockSites = [
	{
		ID: 1,
		name: 'My Blog',
		slug: 'myblog.wordpress.com',
		URL: 'https://myblog.wordpress.com',
		capabilities: { manage_options: true },
		site_migration: { migration_status: '' },
	},
	{
		ID: 2,
		name: 'Online Store',
		slug: 'casually-left-cherryblossom.commerce-garden.com',
		URL: 'https://casually-left-cherryblossom.commerce-garden.com',
		capabilities: { manage_options: true },
		site_migration: { migration_status: '' },
	},
	{
		ID: 3,
		name: 'Portfolio Site',
		slug: 'portfolio.wordpress.com',
		URL: 'https://portfolio.wordpress.com',
		capabilities: { manage_options: true },
		site_migration: { migration_status: '' },
	},
] as Site[];

describe( '<SelectSite>', () => {
	beforeEach( () => {
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.2/me/sites' )
			.query( true )
			.reply( 200, { sites: mockSites } );
	} );

	test( 'filters sites by name', async () => {
		const user = userEvent.setup();
		render( <SelectSite onSiteSelect={ jest.fn() } /> );

		await screen.findByText( 'My Blog' );

		const searchInput = screen.getByRole( 'searchbox' );
		await user.type( searchInput, 'Online Store' );

		await waitFor( () => {
			expect( screen.getByText( 'Online Store' ) ).toBeVisible();
			expect( screen.queryByText( 'My Blog' ) ).not.toBeInTheDocument();
			expect( screen.queryByText( 'Portfolio Site' ) ).not.toBeInTheDocument();
		} );
	} );

	test( 'filters sites by URL', async () => {
		const user = userEvent.setup();
		render( <SelectSite onSiteSelect={ jest.fn() } /> );

		await screen.findByText( 'My Blog' );

		const searchInput = screen.getByRole( 'searchbox' );
		await user.type( searchInput, 'casually-left-cherryblossom' );

		await waitFor( () => {
			expect( screen.getByText( 'Online Store' ) ).toBeVisible();
			expect( screen.queryByText( 'My Blog' ) ).not.toBeInTheDocument();
			expect( screen.queryByText( 'Portfolio Site' ) ).not.toBeInTheDocument();
		} );
	} );
} );
