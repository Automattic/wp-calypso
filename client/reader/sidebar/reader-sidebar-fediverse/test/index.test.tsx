/**
 * @jest-environment jsdom
 */
import { QueryClient } from '@tanstack/react-query';
import { screen } from '@testing-library/react';
import nock from 'nock';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { ReaderSidebarFediverse } from '../index';

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
	site_host: string;
	avatar?: string | null;
}

function mockConnections( connections: MockConnection[] ) {
	nock( BASE )
		.get( '/wpcom/v2/reader/activitypub/connections' )
		.reply( 200, {
			connections: connections.map( ( c ) => ( {
				id: c.id,
				handle: c.handle,
				site_host: c.site_host,
				avatar: c.avatar ?? null,
				actor_url: `https://${ c.site_host }/activitypub/actor`,
				blog_id: c.id * 100,
				actor_type: 'user',
			} ) ),
		} );
}

describe( 'ReaderSidebarFediverse', () => {
	afterEach( () => nock.cleanAll() );

	it( 'does not fetch connections on non-fediverse paths and renders a flat link', async () => {
		// No nock mock — if the query fired, nock would throw on the unmatched request.
		renderWithProvider( <ReaderSidebarFediverse path="/reader" />, {
			queryClient: makeClient(),
		} );

		const link = await screen.findByRole( 'link', { name: /fediverse/i } );
		expect( link ).toHaveAttribute( 'href', '/reader/fediverse' );

		// No expanded list of per-connection items or Add account link.
		expect( screen.queryByRole( 'link', { name: /Add account/ } ) ).not.toBeInTheDocument();
	} );

	it( 'on /reader/fediverse with zero connections, renders only Add account', async () => {
		mockConnections( [] );

		renderWithProvider( <ReaderSidebarFediverse path="/reader/fediverse" />, {
			queryClient: makeClient(),
		} );

		const addLink = await screen.findByRole( 'link', { name: /Add account/ } );
		expect( addLink ).toBeVisible();
	} );

	it( 'renders a row per connection plus Add account when on /reader/fediverse/:id/:tab', async () => {
		mockConnections( [
			{
				id: 1,
				handle: '@alice@mastodon.social',
				site_host: 'mastodon.social',
				avatar: 'https://cdn/1.png',
			},
			{
				id: 2,
				handle: '@bob@fosstodon.org',
				site_host: 'fosstodon.org',
				avatar: 'https://cdn/2.png',
			},
		] );

		renderWithProvider( <ReaderSidebarFediverse path="/reader/fediverse/1/timeline" />, {
			queryClient: makeClient(),
		} );

		// Both connection handles appear as link labels (displayName = handle).
		const row1 = await screen.findByRole( 'link', { name: /@alice@mastodon\.social/i } );
		const row2 = await screen.findByRole( 'link', { name: /@bob@fosstodon\.org/i } );
		expect( row1 ).toHaveAttribute( 'href', '/reader/fediverse/1/timeline' );
		expect( row2 ).toHaveAttribute( 'href', '/reader/fediverse/2/timeline' );

		// Add account link present.
		expect( screen.getByRole( 'link', { name: /Add account/ } ) ).toBeVisible();
	} );

	it( 'marks the active row (matching :id in the path) as selected', async () => {
		mockConnections( [
			{ id: 1, handle: '@alice@mastodon.social', site_host: 'mastodon.social' },
			{ id: 2, handle: '@bob@fosstodon.org', site_host: 'fosstodon.org' },
		] );

		const { container } = renderWithProvider(
			<ReaderSidebarFediverse path="/reader/fediverse/2/timeline" />,
			{ queryClient: makeClient() }
		);

		// Wait until the connection rows have rendered.
		await screen.findByRole( 'link', { name: /@bob@fosstodon\.org/i } );

		// Exactly one selected row, matching the :id in the path.
		const selected = container.querySelectorAll( 'li.selected' );
		expect( selected ).toHaveLength( 1 );
		expect( selected[ 0 ].textContent ).toContain( '@bob@fosstodon.org' );
	} );
} );
