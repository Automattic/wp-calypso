/**
 * @jest-environment jsdom
 */
import { QueryClient } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { ReaderSidebarMastodon } from '../index';

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
	instance: string;
	display_name?: string;
	avatar?: string | null;
}

function mockConnections( connections: MockConnection[] ) {
	nock( BASE )
		.get( '/wpcom/v2/reader/mastodon/connections' )
		.reply( 200, {
			connections: connections.map( ( c ) => ( {
				id: c.id,
				handle: c.handle,
				instance: c.instance,
				display_name: c.display_name ?? c.handle,
				avatar: c.avatar ?? null,
			} ) ),
		} );
}

interface MockConnectionDetails {
	id: number;
	displayName: string;
	handle: string;
	instance: string;
	avatar?: string | null;
}

function mockConnection( {
	id,
	displayName,
	handle,
	instance,
	avatar = null,
}: MockConnectionDetails ) {
	nock( BASE )
		.get( `/wpcom/v2/reader/mastodon/connections/${ id }` )
		.reply( 200, {
			handle,
			instance,
			display_name: displayName,
			description: '',
			avatar,
			header: null,
			counts: { followers: 0, following: 0, posts: 0 },
			raw: {},
		} );
}

describe( 'ReaderSidebarMastodon', () => {
	afterEach( () => nock.cleanAll() );

	it( 'does not fetch connections on non-mastodon paths and renders a flat link', async () => {
		// No nock mock — if the query fired, nock would throw on the unmatched request.
		renderWithProvider( <ReaderSidebarMastodon path="/reader" />, {
			queryClient: makeClient(),
		} );

		const link = await screen.findByRole( 'link', { name: /mastodon/i } );
		expect( link ).toHaveAttribute( 'href', '/reader/mastodon' );

		// No expanded list of per-connection items or Add account link.
		expect( screen.queryByRole( 'link', { name: /Add account/ } ) ).not.toBeInTheDocument();
	} );

	it( 'on /reader/mastodon with zero connections, renders only Add account', async () => {
		mockConnections( [] );

		renderWithProvider( <ReaderSidebarMastodon path="/reader/mastodon" />, {
			queryClient: makeClient(),
		} );

		const addLink = await screen.findByRole( 'link', { name: /Add account/ } );
		expect( addLink ).toBeVisible();

		// No connection rows.
		expect( screen.queryByText( /@mastodon\.social/ ) ).not.toBeInTheDocument();
	} );

	it( 'renders a row per connection plus Add account when on /reader/mastodon/:id/:tab', async () => {
		mockConnections( [
			{
				id: 1,
				handle: '@alice1@mastodon.social',
				instance: 'mastodon.social',
				display_name: 'Alice 1',
			},
			{
				id: 2,
				handle: '@alice2@hachyderm.io',
				instance: 'hachyderm.io',
				display_name: 'Alice 2',
			},
		] );
		mockConnection( {
			id: 1,
			displayName: 'Alice 1',
			handle: '@alice1@mastodon.social',
			instance: 'mastodon.social',
			avatar: 'https://cdn/1.png',
		} );
		mockConnection( {
			id: 2,
			displayName: 'Alice 2',
			handle: '@alice2@hachyderm.io',
			instance: 'hachyderm.io',
			avatar: 'https://cdn/2.png',
		} );

		const { container } = renderWithProvider(
			<ReaderSidebarMastodon path="/reader/mastodon/1/timeline" />,
			{ queryClient: makeClient() }
		);

		// Both connection display names appear as link labels.
		const row1 = await screen.findByRole( 'link', { name: /Alice 1/ } );
		const row2 = await screen.findByRole( 'link', { name: /Alice 2/ } );
		expect( row1 ).toHaveAttribute( 'href', '/reader/mastodon/1/timeline' );
		expect( row2 ).toHaveAttribute( 'href', '/reader/mastodon/2/timeline' );

		// Webfinger handles (@user@instance) from the list endpoint appear as
		// the byline. Use exact strings + negative assertion to catch the
		// `@user@instance@instance` instance-doubling regression.
		expect( screen.getByText( '@alice1@mastodon.social' ) ).toBeVisible();
		expect( screen.getByText( '@alice2@hachyderm.io' ) ).toBeVisible();
		expect( screen.queryByText( /@mastodon\.social@mastodon\.social/ ) ).not.toBeInTheDocument();
		expect( screen.queryByText( /@hachyderm\.io@hachyderm\.io/ ) ).not.toBeInTheDocument();

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
			{
				id: 1,
				handle: '@alice1@mastodon.social',
				instance: 'mastodon.social',
				display_name: 'Alice 1',
			},
			{
				id: 2,
				handle: '@alice2@hachyderm.io',
				instance: 'hachyderm.io',
				display_name: 'Alice 2',
			},
		] );
		mockConnection( {
			id: 1,
			displayName: 'Alice 1',
			handle: '@alice1@mastodon.social',
			instance: 'mastodon.social',
		} );
		mockConnection( {
			id: 2,
			displayName: 'Alice 2',
			handle: '@alice2@hachyderm.io',
			instance: 'hachyderm.io',
		} );

		const { container } = renderWithProvider(
			<ReaderSidebarMastodon path="/reader/mastodon/2/timeline" />,
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
