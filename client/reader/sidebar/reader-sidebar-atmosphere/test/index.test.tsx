/**
 * @jest-environment jsdom
 */
import { QueryClient } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { ReaderSidebarAtmosphere } from '../index';

jest.mock( '@automattic/calypso-router', () => ( {
	__esModule: true,
	default: jest.fn(),
} ) );

const BASE = 'https://public-api.wordpress.com';

function makeClient() {
	return new QueryClient( {
		defaultOptions: { queries: { retry: false, staleTime: 0 } },
	} );
}

function mockConnections( connections: unknown[] ) {
	nock( BASE ).get( '/wpcom/v2/reader/atmosphere/connections' ).reply( 200, { connections } );
}

describe( 'ReaderSidebarAtmosphere', () => {
	afterEach( () => nock.cleanAll() );

	it( 'renders a flat ATmosphere link with no sub-items when there are no connections', async () => {
		mockConnections( [] );

		renderWithProvider( <ReaderSidebarAtmosphere path="/reader" />, { queryClient: makeClient() } );

		const link = await screen.findByRole( 'link', { name: /atmosphere/i } );
		expect( link ).toBeVisible();
		expect( link ).toHaveAttribute( 'href', '/reader/atmosphere' );

		expect( screen.queryByRole( 'link', { name: 'Timeline' } ) ).not.toBeInTheDocument();
		expect( screen.queryByRole( 'link', { name: 'Profile' } ) ).not.toBeInTheDocument();
		expect( screen.queryByRole( 'link', { name: 'Settings' } ) ).not.toBeInTheDocument();
	} );

	it( 'renders Timeline/Profile/Settings sub-links when there is at least one connection', async () => {
		mockConnections( [ { id: 101, handle: 'alice.bsky.social', did: 'did:plc:a', avatar: null } ] );

		const { container } = renderWithProvider(
			<ReaderSidebarAtmosphere path="/reader/atmosphere/timeline" />,
			{ queryClient: makeClient() }
		);

		await waitFor( () =>
			expect( container.querySelectorAll( '.sidebar__menu-item' ).length ).toBeGreaterThan( 0 )
		);

		const timeline = screen.getByRole( 'link', { name: 'Timeline' } );
		expect( timeline ).toHaveAttribute( 'href', '/reader/atmosphere/timeline' );

		expect( screen.getByRole( 'link', { name: 'Profile' } ) ).toHaveAttribute(
			'href',
			'/reader/atmosphere/profile'
		);
		expect( screen.getByRole( 'link', { name: 'Settings' } ) ).toHaveAttribute(
			'href',
			'/reader/atmosphere/settings'
		);
	} );

	it( 'auto-opens the submenu when the path starts with /reader/atmosphere/', async () => {
		mockConnections( [ { id: 101, handle: 'alice.bsky.social', did: 'did:plc:a', avatar: null } ] );

		const { container } = renderWithProvider(
			<ReaderSidebarAtmosphere path="/reader/atmosphere/profile" />,
			{ queryClient: makeClient() }
		);

		await waitFor( () =>
			expect( container.querySelectorAll( '.sidebar__menu-item' ).length ).toBeGreaterThan( 0 )
		);

		const submenu = container.querySelector( '.sidebar__expandable-content' );
		expect( submenu ).not.toBeNull();
		expect( submenu ).not.toHaveAttribute( 'hidden' );
	} );

	it( 'does not fetch connections on non-atmosphere paths and renders a flat link', async () => {
		// No nock mock — if the query fired, nock would throw on the unmatched request.
		renderWithProvider( <ReaderSidebarAtmosphere path="/reader" />, {
			queryClient: makeClient(),
		} );

		const link = await screen.findByRole( 'link', { name: /atmosphere/i } );
		expect( link ).toHaveAttribute( 'href', '/reader/atmosphere' );
		expect( screen.queryByRole( 'link', { name: 'Timeline' } ) ).not.toBeInTheDocument();
	} );
} );
