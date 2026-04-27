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
import type { AtmosphereConnection } from '@automattic/api-core';

const connection: AtmosphereConnection = {
	id: 42,
	did: 'did:plc:abc',
	handle: 'alice.bsky.social',
	display_name: 'Alice',
	avatar: null,
};

const BASE = 'https://public-api.wordpress.com';
const PATH = '/wpcom/v2/reader/atmosphere/connections/42/timeline';

function makePost( uri: string, text = 'hello' ) {
	return {
		uri,
		cid: 'c',
		author: {
			did: 'did:plc:abc',
			handle: 'alice.bsky.social',
			display_name: 'Alice',
			avatar: null,
		},
		created_at: '2026-04-27T10:00:00Z',
		indexed_at: '2026-04-27T10:00:00Z',
		text,
		html: `<p>${ text }</p>`,
		lang: [],
		reply_parent: null,
		reply_root: null,
		reason: null,
		embed: null,
		counts: { replies: 0, reposts: 0, likes: 0, quotes: 0 },
		bluesky_url: 'https://bsky.app/profile/alice.bsky.social/post/x',
	};
}

function makeQueryClient() {
	return new QueryClient( { defaultOptions: { queries: { retry: false } } } );
}

describe( 'TimelinePanel', () => {
	beforeEach( () => {
		// recordReaderTracksEvent is a thunk that reads state.reader.follows.
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
			.reply( 200, { items: [ makePost( 'at://x', 'first post' ) ], cursor: null } );

		const { container } = renderWithProvider( <TimelinePanel connection={ connection } />, {
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

		renderWithProvider( <TimelinePanel connection={ connection } />, {
			queryClient: makeQueryClient(),
		} );
		await waitFor( () =>
			expect( spy ).toHaveBeenCalledWith(
				'calypso_reader_atmosphere_timeline_viewed',
				expect.objectContaining( { connection_id: 42 } )
			)
		);
	} );

	it( 'renders the empty state when feed is []', async () => {
		nock( BASE ).get( PATH ).query( {} ).reply( 200, { items: [], cursor: null } );

		renderWithProvider( <TimelinePanel connection={ connection } />, {
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
			.reply( 200, { items: [ makePost( 'at://1', 'first' ) ], cursor: 'next' } );
		nock( BASE )
			.get( PATH )
			.query( { cursor: 'next' } )
			.reply( 200, { items: [ makePost( 'at://2', 'second' ) ], cursor: null } );

		renderWithProvider( <TimelinePanel connection={ connection } />, {
			queryClient: makeQueryClient(),
		} );
		await waitFor( () => expect( screen.getByText( 'first' ) ).toBeVisible() );
		mockAllIsIntersecting( true );
		await waitFor( () => expect( screen.getByText( 'second' ) ).toBeVisible() );
	} );

	it( 'fires error_shown on upstream_unavailable + recovers via Retry', async () => {
		const spy = analytics.recordReaderTracksEvent as unknown as jest.Mock;
		nock( BASE )
			.get( PATH )
			.query( {} )
			.reply( 502, { error: 'atmosphere_upstream_unavailable', message: 'down' } );

		const user = userEvent.setup();
		renderWithProvider( <TimelinePanel connection={ connection } />, {
			queryClient: makeQueryClient(),
		} );
		await waitFor( () =>
			expect( screen.getAllByText( /unreachable/i ).length ).toBeGreaterThan( 0 )
		);
		expect( spy ).toHaveBeenCalledWith(
			'calypso_reader_atmosphere_timeline_error_shown',
			expect.objectContaining( { connection_id: 42, error_kind: 'upstream_unavailable' } )
		);

		nock( BASE )
			.get( PATH )
			.query( {} )
			.reply( 200, { items: [ makePost( 'at://x', 'recovered' ) ], cursor: null } );
		await user.click( screen.getByRole( 'button', { name: /retry/i } ) );
		await waitFor( () => expect( screen.getByText( 'recovered' ) ).toBeVisible() );
		expect( spy ).toHaveBeenCalledWith(
			'calypso_reader_atmosphere_timeline_retry_clicked',
			expect.objectContaining( { connection_id: 42, error_kind: 'upstream_unavailable' } )
		);
	} );

	it( 'fires post_clicked when the timestamp anchor is clicked', async () => {
		const spy = analytics.recordReaderTracksEvent as unknown as jest.Mock;
		nock( BASE )
			.get( PATH )
			.query( {} )
			.reply( 200, { items: [ makePost( 'at://abc', 'hello' ) ], cursor: null } );
		const user = userEvent.setup();
		renderWithProvider( <TimelinePanel connection={ connection } />, {
			queryClient: makeQueryClient(),
		} );
		await waitFor( () => expect( screen.getByText( 'hello' ) ).toBeVisible() );
		const link = screen
			.getAllByRole( 'link' )
			.find(
				( a ) => a.getAttribute( 'href' ) === 'https://bsky.app/profile/alice.bsky.social/post/x'
			);
		expect( link ).toBeDefined();
		await user.click( link as HTMLElement );
		expect( spy ).toHaveBeenCalledWith(
			'calypso_reader_atmosphere_timeline_post_clicked',
			expect.objectContaining( { connection_id: 42, post_uri: 'at://abc' } )
		);
	} );

	it( 'fires author_clicked when the author anchor is clicked', async () => {
		const spy = analytics.recordReaderTracksEvent as unknown as jest.Mock;
		nock( BASE )
			.get( PATH )
			.query( {} )
			.reply( 200, { items: [ makePost( 'at://abc', 'hi' ) ], cursor: null } );
		const user = userEvent.setup();
		renderWithProvider( <TimelinePanel connection={ connection } />, {
			queryClient: makeQueryClient(),
		} );
		await waitFor( () => expect( screen.getByText( 'hi' ) ).toBeVisible() );
		await user.click( screen.getByRole( 'link', { name: /alice/i } ) );
		expect( spy ).toHaveBeenCalledWith(
			'calypso_reader_atmosphere_timeline_author_clicked',
			expect.objectContaining( { connection_id: 42, author_handle: 'alice.bsky.social' } )
		);
	} );

	it( 'fires external_clicked when an external embed is clicked', async () => {
		const spy = analytics.recordReaderTracksEvent as unknown as jest.Mock;
		const post = makePost( 'at://abc', 'with link' );
		( post as unknown as { embed: unknown } ).embed = {
			type: 'external',
			uri: 'https://example.com/article',
			title: 'T',
			description: 'D',
			thumb: null,
		};
		nock( BASE )
			.get( PATH )
			.query( {} )
			.reply( 200, { items: [ post ], cursor: null } );
		const user = userEvent.setup();
		renderWithProvider( <TimelinePanel connection={ connection } />, {
			queryClient: makeQueryClient(),
		} );
		await waitFor( () => expect( screen.getByText( 'T' ) ).toBeVisible() );
		await user.click( screen.getByText( 'T' ) );
		expect( spy ).toHaveBeenCalledWith(
			'calypso_reader_atmosphere_timeline_external_clicked',
			expect.objectContaining( {
				connection_id: 42,
				post_uri: 'at://abc',
				external_uri: 'https://example.com/article',
			} )
		);
	} );

	it( 'fires quote_clicked when a live quote embed is clicked', async () => {
		const spy = analytics.recordReaderTracksEvent as unknown as jest.Mock;
		const inner = makePost( 'at://quoted', 'inner text' );
		const outer = makePost( 'at://abc', 'outer' );
		( outer as unknown as { embed: unknown } ).embed = { type: 'quote', post: inner };
		nock( BASE )
			.get( PATH )
			.query( {} )
			.reply( 200, { items: [ outer ], cursor: null } );
		const user = userEvent.setup();
		renderWithProvider( <TimelinePanel connection={ connection } />, {
			queryClient: makeQueryClient(),
		} );
		await waitFor( () => expect( screen.getByText( 'inner text' ) ).toBeVisible() );
		await user.click( screen.getByText( 'inner text' ) );
		expect( spy ).toHaveBeenCalledWith(
			'calypso_reader_atmosphere_timeline_quote_clicked',
			expect.objectContaining( {
				connection_id: 42,
				parent_uri: 'at://abc',
				quoted_uri: 'at://quoted',
			} )
		);
	} );
} );
