/**
 * @vitest-environment jsdom
 */
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { vi } from 'vitest';
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
		slug: 'mystore.wordpress.com',
		URL: 'https://mystore.wordpress.com',
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

// Enough sites for two pages of ten.
const manySites = Array.from( { length: 12 }, ( _, index ) => ( {
	ID: 100 + index,
	name: `Paged Site ${ index + 1 }`,
	slug: `paged${ index + 1 }.wordpress.com`,
	URL: `https://paged${ index + 1 }.wordpress.com`,
	capabilities: { manage_options: true },
	site_migration: { migration_status: '' },
} ) ) as Site[];

function mockSitesResponse( sites: Site[] ) {
	nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.2/me/sites' )
		.query( true )
		.reply( 200, { sites } );
}

describe( '<SelectSite>', () => {
	beforeEach( () => {
		mockSitesResponse( mockSites );
	} );

	test( 'filters sites by name', async () => {
		const user = userEvent.setup();
		render( <SelectSite onSiteSelect={ vi.fn() } /> );

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
		render( <SelectSite onSiteSelect={ vi.fn() } /> );

		await screen.findByText( 'My Blog' );

		const searchInput = screen.getByRole( 'searchbox' );
		await user.type( searchInput, 'mystore' );

		await waitFor( () => {
			expect( screen.getByText( 'Online Store' ) ).toBeVisible();
			expect( screen.queryByText( 'My Blog' ) ).not.toBeInTheDocument();
			expect( screen.queryByText( 'Portfolio Site' ) ).not.toBeInTheDocument();
		} );
	} );

	test( 'shows no pagination when the sites fit in one page', async () => {
		render( <SelectSite onSiteSelect={ vi.fn() } /> );

		await screen.findByText( 'My Blog' );

		expect( screen.queryByRole( 'button', { name: 'Next page' } ) ).not.toBeInTheDocument();
	} );

	test( 'selects a site with one click', async () => {
		const user = userEvent.setup();
		const onSiteSelect = vi.fn();
		render( <SelectSite onSiteSelect={ onSiteSelect } /> );

		await screen.findByText( 'My Blog' );
		await user.click( screen.getByRole( 'button', { name: 'Online Store' } ) );

		expect( onSiteSelect ).toHaveBeenCalledWith( expect.objectContaining( { ID: 2 } ) );
	} );
} );

describe( '<SelectSite> with more than one page of sites', () => {
	beforeEach( () => {
		mockSitesResponse( manySites );
	} );

	test( 'shows the first ten sites, then the next ones on page 2', async () => {
		const user = userEvent.setup();
		render( <SelectSite onSiteSelect={ vi.fn() } /> );

		await screen.findByText( 'Paged Site 1' );
		expect( screen.getByText( 'Paged Site 10' ) ).toBeVisible();
		expect( screen.queryByText( 'Paged Site 11' ) ).not.toBeInTheDocument();

		await user.click( screen.getByRole( 'button', { name: 'Next page' } ) );

		await screen.findByText( 'Paged Site 11' );
		expect( screen.getByText( 'Paged Site 12' ) ).toBeVisible();
		expect( screen.queryByText( 'Paged Site 1' ) ).not.toBeInTheDocument();
	} );

	test( 'goes back to page 1 when the search changes', async () => {
		const user = userEvent.setup();
		render( <SelectSite onSiteSelect={ vi.fn() } /> );

		await screen.findByText( 'Paged Site 1' );
		await user.click( screen.getByRole( 'button', { name: 'Next page' } ) );
		await screen.findByText( 'Paged Site 11' );

		// Every site still matches, so the results keep two pages.
		await user.type( screen.getByRole( 'searchbox' ), 'Paged Site' );

		await waitFor( () => {
			expect( screen.getByText( 'Paged Site 1' ) ).toBeVisible();
			expect( screen.queryByText( 'Paged Site 11' ) ).not.toBeInTheDocument();
		} );
	} );
} );
