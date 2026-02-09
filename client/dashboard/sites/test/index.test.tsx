/**
 * @jest-environment jsdom
 */

import { screen, waitFor, within } from '@testing-library/react';
import nock from 'nock';
import { render } from '../../test-utils';
import Sites from '../index';
import type { Site, User } from '@automattic/api-core';

const mockSites = [
	{
		ID: 1,
		name: 'My First Site',
		slug: 'my-first-site.wordpress.com',
		URL: 'https://my-first-site.wordpress.com',
		is_coming_soon: false,
		is_private: false,
		subscribers_count: 123,
		site_migration: {},
		plan: { product_slug: 'business-bundle', product_name_short: 'Business' },
	} as Site,
	{
		ID: 2,
		name: 'My Second Site',
		slug: 'my-second-site.wordpress.com',
		URL: 'https://my-second-site.wordpress.com',
		is_coming_soon: true,
		is_private: false,
		subscribers_count: 456,
		site_migration: {},
		plan: { product_slug: 'free_plan', product_name_short: 'Free' },
	} as Site,
];

describe( '<Sites>', () => {
	beforeEach( () => {
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.2/read/teams' )
			.query( true )
			.reply( 200, { teams: [] } );

		nock( 'https://public-api.wordpress.com' )
			.persist()
			.get( '/rest/v1.1/me/preferences' )
			.query( true )
			.reply( 200, { calypso_preferences: {} } );

		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.2/me/sites' )
			.query( true )
			.reply( 200, { sites: mockSites } );
	} );

	test( 'renders Add new site button', async () => {
		render( <Sites />, {
			user: {
				site_count: mockSites.length,
			} as User,
		} );

		expect( await screen.findByRole( 'button', { name: 'Add new site' } ) ).toBeVisible();
	} );

	test( 'renders empty state when the user has no sites', async () => {
		render( <Sites />, {
			user: {
				site_count: 0,
			} as User,
		} );

		expect(
			await screen.findByRole( 'heading', { name: /You don.t have any sites yet/ } )
		).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'Create a site' } ) ).toBeVisible();
		expect( screen.queryByRole( 'table' ) ).not.toBeInTheDocument();
	} );

	test( 'renders DataViews when the user has sites', async () => {
		render( <Sites />, {
			user: {
				site_count: 13, // more than 12 sites to force the table layout
			} as User,
		} );

		const table = await screen.findByRole( 'table' );
		await waitFor( () => expect( within( table ).getAllByRole( 'row' ) ).toHaveLength( 3 ) );

		const rows = within( table ).getAllByRole( 'row' );

		const header = within( rows[ 0 ] ).getAllByRole( 'columnheader' );
		expect( header[ 0 ] ).toHaveTextContent( 'Site' );
		expect( header[ 1 ] ).toHaveTextContent( 'Visibility' );
		expect( header[ 2 ] ).toHaveTextContent( '7-day visitors' );
		expect( header[ 3 ] ).toHaveTextContent( 'Subscribers' );
		expect( header[ 4 ] ).toHaveTextContent( 'Plan' );

		const row1 = within( rows[ 1 ] ).getAllByRole( 'cell' );
		expect( row1[ 0 ] ).toHaveTextContent( 'My First Site' );
		expect( row1[ 0 ] ).toHaveTextContent( 'my-first-site.wordpress.com' );
		expect( row1[ 1 ] ).toHaveTextContent( 'Public' );
		expect( row1[ 2 ] ).toHaveAccessibleName( '' ); // empty because it's async-loaded
		expect( row1[ 3 ] ).toHaveTextContent( '123' );
		expect( row1[ 4 ] ).toHaveTextContent( 'Business' );

		const row2 = within( rows[ 2 ] ).getAllByRole( 'cell' );
		expect( row2[ 0 ] ).toHaveTextContent( 'My Second Site' );
		expect( row2[ 0 ] ).toHaveTextContent( 'my-second-site.wordpress.com' );
		expect( row2[ 1 ] ).toHaveTextContent( 'Coming soon' );
		expect( row2[ 2 ] ).toHaveAccessibleName( '' ); // empty because it's async-loaded
		expect( row2[ 3 ] ).toHaveTextContent( '456' );
		expect( row2[ 4 ] ).toHaveTextContent( 'Free' );
	} );
} );
