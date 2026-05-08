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

interface MockConnection {
	id: number;
	handle: string;
	did: string;
	display_name?: string;
	avatar?: string | null;
}

function mockConnections( connections: MockConnection[] ) {
	nock( BASE )
		.get( '/wpcom/v2/reader/atmosphere/connections' )
		.reply( 200, {
			connections: connections.map( ( c ) => ( {
				id: c.id,
				handle: c.handle,
				did: c.did,
				display_name: c.display_name ?? c.handle,
				avatar: c.avatar ?? null,
			} ) ),
		} );
}

interface MockConnectionDetails {
	id: number;
	displayName: string;
	handle: string;
	did: string;
	avatar?: string | null;
}

function mockConnection( { id, displayName, handle, did, avatar = null }: MockConnectionDetails ) {
	nock( BASE )
		.get( `/wpcom/v2/reader/atmosphere/connections/${ id }` )
		.reply( 200, {
			did,
			handle,
			display_name: displayName,
			description: '',
			avatar,
			banner: null,
			counts: { followers: 0, follows: 0, posts: 0 },
		} );
}

describe( 'ReaderSidebarAtmosphere', () => {
	afterEach( () => nock.cleanAll() );

	it( 'does not fetch connections on non-atmosphere paths and renders a flat link', async () => {
		// No nock mock — if the query fired, nock would throw on the unmatched request.
		renderWithProvider( <ReaderSidebarAtmosphere path="/reader" />, {
			queryClient: makeClient(),
		} );

		const link = await screen.findByRole( 'link', { name: /atmosphere/i } );
		expect( link ).toHaveAttribute( 'href', '/reader/atmosphere' );

		// No expanded list of per-connection items or Add account link.
		expect( screen.queryByRole( 'link', { name: /Add account/ } ) ).not.toBeInTheDocument();
	} );

	it( 'on /reader/atmosphere with zero connections, renders only Add account', async () => {
		mockConnections( [] );

		renderWithProvider( <ReaderSidebarAtmosphere path="/reader/atmosphere" />, {
			queryClient: makeClient(),
		} );

		const addLink = await screen.findByRole( 'link', { name: /Add account/ } );
		expect( addLink ).toBeVisible();

		// No connection rows.
		expect( screen.queryByText( /\.bsky\.social/ ) ).not.toBeInTheDocument();
	} );

	it( 'renders a row per connection plus Add account when on /reader/atmosphere/:id/:tab', async () => {
		mockConnections( [
			{ id: 1, handle: 'alice1.bsky.social', did: 'did:plc:a1', display_name: 'Alice 1' },
			{ id: 2, handle: 'alice2.bsky.social', did: 'did:plc:a2', display_name: 'Alice 2' },
		] );
		mockConnection( {
			id: 1,
			displayName: 'Alice 1',
			handle: 'alice1.bsky.social',
			did: 'did:plc:a1',
			avatar: 'https://cdn/1.png',
		} );
		mockConnection( {
			id: 2,
			displayName: 'Alice 2',
			handle: 'alice2.bsky.social',
			did: 'did:plc:a2',
			avatar: 'https://cdn/2.png',
		} );

		const { container } = renderWithProvider(
			<ReaderSidebarAtmosphere path="/reader/atmosphere/1/timeline" />,
			{ queryClient: makeClient() }
		);

		// Both connection display names appear as link labels.
		const row1 = await screen.findByRole( 'link', { name: /Alice 1/ } );
		const row2 = await screen.findByRole( 'link', { name: /Alice 2/ } );
		expect( row1 ).toHaveAttribute( 'href', '/reader/atmosphere/1/timeline' );
		expect( row2 ).toHaveAttribute( 'href', '/reader/atmosphere/2/timeline' );

		// Handles appear as the byline, prefixed with @ (Bluesky display convention).
		expect( screen.getByText( '@alice1.bsky.social' ) ).toBeVisible();
		expect( screen.getByText( '@alice2.bsky.social' ) ).toBeVisible();

		// Avatars are presentational (alt=""), so query the <img> directly by src.
		await waitFor( () => {
			expect( container.querySelector( 'img[src="https://cdn/1.png"]' ) ).toBeVisible();
			expect( container.querySelector( 'img[src="https://cdn/2.png"]' ) ).toBeVisible();
		} );

		// Add account link present.
		expect( screen.getByRole( 'link', { name: /Add account/ } ) ).toBeVisible();
	} );

	it( 'marks the active row (matching :id in the path) as selected', async () => {
		mockConnections( [
			{ id: 1, handle: 'alice1.bsky.social', did: 'did:plc:a1', display_name: 'Alice 1' },
			{ id: 2, handle: 'alice2.bsky.social', did: 'did:plc:a2', display_name: 'Alice 2' },
		] );
		mockConnection( {
			id: 1,
			displayName: 'Alice 1',
			handle: 'alice1.bsky.social',
			did: 'did:plc:a1',
		} );
		mockConnection( {
			id: 2,
			displayName: 'Alice 2',
			handle: 'alice2.bsky.social',
			did: 'did:plc:a2',
		} );

		const { container } = renderWithProvider(
			<ReaderSidebarAtmosphere path="/reader/atmosphere/2/timeline" />,
			{ queryClient: makeClient() }
		);

		// Wait until the per-connection rows have rendered.
		await screen.findByRole( 'link', { name: /Alice 2/ } );

		// Exactly one selected row, matching the :id in the path.
		// MenuItem emits `selected` on the <li>; there's no aria-current today,
		// so the class is the stable hook for sidebar styles.
		const selected = container.querySelectorAll( 'li.selected' );
		expect( selected ).toHaveLength( 1 );
		expect( selected[ 0 ].textContent ).toContain( 'Alice 2' );
	} );
} );
