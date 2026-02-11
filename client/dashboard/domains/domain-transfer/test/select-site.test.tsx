/**
 * @jest-environment jsdom
 */
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../../test-utils';
import { SelectSite } from '../select-site';
import type { Site } from '@automattic/api-core';
import type { DeepPartial } from 'utility-types';

const mockSitesQuery = jest.fn();

jest.mock( '../../../app/context', () => ( {
	...jest.requireActual( '../../../app/context' ),
	useAppContext: jest.fn( () => ( {
		queries: {
			sitesQuery: () => mockSitesQuery(),
		},
	} ) ),
} ) );

jest.mock( '../../../sites/features', () => ( {
	canManageSite: () => true,
} ) );

const mockSites: DeepPartial< Site >[] = [
	{
		ID: 1,
		name: 'My Blog',
		slug: 'myblog.wordpress.com',
		URL: 'https://myblog.wordpress.com',
		site_migration: { migration_status: '' },
	},
	{
		ID: 2,
		name: 'Online Store',
		slug: 'casually-left-cherryblossom.commerce-garden.com',
		URL: 'https://casually-left-cherryblossom.commerce-garden.com',
		site_migration: { migration_status: '' },
	},
	{
		ID: 3,
		name: 'Portfolio Site',
		slug: 'portfolio.wordpress.com',
		URL: 'https://portfolio.wordpress.com',
		site_migration: { migration_status: '' },
	},
];

function renderSelectSite( onSiteSelect = jest.fn() ) {
	mockSitesQuery.mockReturnValue( {
		queryKey: [ 'sites' ],
		queryFn: () => Promise.resolve( mockSites ),
	} );

	return render( <SelectSite onSiteSelect={ onSiteSelect } /> );
}

afterEach( () => {
	jest.clearAllMocks();
} );

test( 'filters sites by name', async () => {
	const user = userEvent.setup();
	renderSelectSite();

	await waitFor( () => {
		expect( screen.getByText( 'My Blog' ) ).toBeVisible();
	} );

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
	renderSelectSite();

	await waitFor( () => {
		expect( screen.getByText( 'My Blog' ) ).toBeVisible();
	} );

	const searchInput = screen.getByRole( 'searchbox' );
	await user.type( searchInput, 'casually-left-cherryblossom' );

	await waitFor( () => {
		expect( screen.getByText( 'Online Store' ) ).toBeVisible();
		expect( screen.queryByText( 'My Blog' ) ).not.toBeInTheDocument();
		expect( screen.queryByText( 'Portfolio Site' ) ).not.toBeInTheDocument();
	} );
} );
