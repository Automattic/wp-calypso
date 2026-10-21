/**
 * @jest-environment jsdom
 */
import { QueryClient } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { mockAllIsIntersecting } from 'react-intersection-observer/test-utils';
import * as analytics from 'calypso/state/reader/analytics/actions';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { TimelinePanel } from '../timeline-panel';
import type { MastodonConnection } from '@automattic/api-core';

const CONNECTION: MastodonConnection = {
	id: 9,
	handle: '@alice@mastodon.social',
	instance: 'mastodon.social',
	display_name: 'Alice',
	avatar: null,
};

const BASE = 'https://public-api.wordpress.com';
const PATH = '/wpcom/v2/reader/mastodon/connections/9/timeline';

function makePost( id: string, content = 'hello' ) {
	return {
		id,
		url: `https://mastodon.social/@alice/${ id }`,
		created_at: '2026-04-27T10:00:00Z',
		account: {
			id: '100',
			username: 'alice',
			acct: 'alice',
			display_name: 'Alice',
			avatar: null,
		},
		content: `<p>${ content }</p>`,
		spoiler_text: '',
		sensitive: false,
		language: 'en',
		in_reply_to_id: null,
		in_reply_to_account_id: null,
		boost: null,
		media: [],
		counts: { replies: 0, boosts: 0, favourites: 0 },
	};
}

function makeQueryClient() {
	return new QueryClient( { defaultOptions: { queries: { retry: false } } } );
}

describe( 'Mastodon TimelinePanel', () => {
	beforeEach( () => {
		// recordReaderTracksEvent is a thunk that reads the follows query cache.
		// Replace it with a no-op action creator so dispatch() doesn't throw,
		// while still letting spies observe call-site arguments.
		jest
			.spyOn( analytics, 'recordReaderTracksEvent' )
			.mockImplementation( () => ( { type: '@@TEST/NOOP' } ) as never );
	} );

	afterEach( () => {
		nock.cleanAll();
		jest.restoreAllMocks();
	} );

	it( 'renders the skeleton, then the first page of posts', async () => {
		nock( BASE )
			.get( PATH )
			.query( {} )
			.reply( 200, { items: [ makePost( '1', 'first post' ) ], cursor: null } );

		const { container } = renderWithProvider( <TimelinePanel connection={ CONNECTION } />, {
			queryClient: makeQueryClient(),
		} );
		expect(
			container.querySelectorAll( '.social-feed-list-skeleton__row' ).length
		).toBeGreaterThan( 0 );
		await waitFor( () => expect( screen.getByText( 'first post' ) ).toBeVisible() );
	} );

	it( 'fires the timeline_viewed Tracks event on mount', async () => {
		const spy = analytics.recordReaderTracksEvent as unknown as jest.Mock;
		nock( BASE ).get( PATH ).query( {} ).reply( 200, { items: [], cursor: null } );

		renderWithProvider( <TimelinePanel connection={ CONNECTION } />, {
			queryClient: makeQueryClient(),
		} );
		await waitFor( () =>
			expect( spy ).toHaveBeenCalledWith(
				'calypso_reader_mastodon_timeline_viewed',
				expect.objectContaining( { connection_id: 9 } )
			)
		);
	} );

	it( 'renders the empty state when feed is []', async () => {
		nock( BASE ).get( PATH ).query( {} ).reply( 200, { items: [], cursor: null } );

		renderWithProvider( <TimelinePanel connection={ CONNECTION } />, {
			queryClient: makeQueryClient(),
		} );
		await waitFor( () =>
			expect( screen.getAllByText( /caught up/i ).length ).toBeGreaterThan( 0 )
		);
	} );

	it( 'paginates when sentinel comes into view', async () => {
		nock( BASE )
			.get( PATH )
			.query( {} )
			.reply( 200, { items: [ makePost( '1', 'first' ) ], cursor: 'next' } );
		nock( BASE )
			.get( PATH )
			.query( { cursor: 'next' } )
			.reply( 200, { items: [ makePost( '2', 'second' ) ], cursor: null } );

		renderWithProvider( <TimelinePanel connection={ CONNECTION } />, {
			queryClient: makeQueryClient(),
		} );
		await waitFor( () => expect( screen.getByText( 'first' ) ).toBeVisible() );
		mockAllIsIntersecting( true );
		await waitFor( () => expect( screen.getByText( 'second' ) ).toBeVisible() );
	} );

	it( 'fires error_shown on upstream_unavailable + recovers via Retry', async () => {
		const spy = analytics.recordReaderTracksEvent as unknown as jest.Mock;
		// upstream_unavailable retries up to 2 times (per the hook's retry
		// policy), so allow up to 3 502s before the failure surfaces.
		nock( BASE )
			.get( PATH )
			.query( {} )
			.times( 3 )
			.reply( 502, { error: 'mastodon_upstream_unavailable', message: 'down' } );

		const user = userEvent.setup();
		renderWithProvider( <TimelinePanel connection={ CONNECTION } />, {
			queryClient: makeQueryClient(),
		} );
		await waitFor(
			() => expect( screen.getAllByText( /unreachable/i ).length ).toBeGreaterThan( 0 ),
			{ timeout: 10_000 }
		);
		expect( spy ).toHaveBeenCalledWith(
			'calypso_reader_mastodon_timeline_error_shown',
			expect.objectContaining( { connection_id: 9, error_kind: 'upstream_unavailable' } )
		);

		nock( BASE )
			.get( PATH )
			.query( {} )
			.reply( 200, { items: [ makePost( '1', 'recovered' ) ], cursor: null } );
		await user.click( screen.getByRole( 'button', { name: /retry/i } ) );
		await waitFor( () => expect( screen.getByText( 'recovered' ) ).toBeVisible() );
		expect( spy ).toHaveBeenCalledWith(
			'calypso_reader_mastodon_timeline_retry_clicked',
			expect.objectContaining( { connection_id: 9, error_kind: 'upstream_unavailable' } )
		);
	}, 15_000 );

	it( 'fires post_clicked when the timestamp anchor is clicked', async () => {
		const spy = analytics.recordReaderTracksEvent as unknown as jest.Mock;
		nock( BASE )
			.get( PATH )
			.query( {} )
			.reply( 200, { items: [ makePost( '1', 'hello' ) ], cursor: null } );
		const user = userEvent.setup();
		renderWithProvider( <TimelinePanel connection={ CONNECTION } />, {
			queryClient: makeQueryClient(),
		} );
		await waitFor( () => expect( screen.getByText( 'hello' ) ).toBeVisible() );
		// With getThreadUrl wired up, the timestamp anchor points at the
		// in-app thread URL rather than the external permalink.
		const expectedHref = '/reader/mastodon/9/thread/1';
		const link = screen
			.getAllByRole( 'link' )
			.find( ( a ) => a.getAttribute( 'href' ) === expectedHref );
		expect( link ).toBeDefined();
		await user.click( link as HTMLElement );
		expect( spy ).toHaveBeenCalledWith(
			'calypso_reader_mastodon_timeline_post_clicked',
			expect.objectContaining( {
				connection_id: 9,
				post_uri: '1',
				destination: 'in_app_thread',
			} )
		);
	} );

	it( 'fires author_clicked when the author anchor is clicked', async () => {
		const spy = analytics.recordReaderTracksEvent as unknown as jest.Mock;
		nock( BASE )
			.get( PATH )
			.query( {} )
			.reply( 200, { items: [ makePost( '1', 'hi' ) ], cursor: null } );
		const user = userEvent.setup();
		renderWithProvider( <TimelinePanel connection={ CONNECTION } />, {
			queryClient: makeQueryClient(),
		} );
		await waitFor( () => expect( screen.getByText( 'hi' ) ).toBeVisible() );
		await user.click( screen.getByRole( 'link', { name: /alice/i } ) );
		expect( spy ).toHaveBeenCalledWith(
			'calypso_reader_mastodon_timeline_author_clicked',
			expect.objectContaining( { connection_id: 9, author_handle: 'alice@mastodon.social' } )
		);
	} );
} );
