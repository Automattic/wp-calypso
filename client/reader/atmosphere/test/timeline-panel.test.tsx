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

const connection7: AtmosphereConnection = {
	id: 7,
	did: 'did:plc:abc234567defghi234567jklab',
	handle: 'alice.bsky.social',
	display_name: 'Alice',
	avatar: null,
};

function makeFeedItem( overrides: Record< string, unknown > = {} ) {
	return {
		...makePost( 'at://did:plc:abc234567defghi234567jklab/app.bsky.feed.post/3kabcdefghijk' ),
		...overrides,
	};
}

describe( 'TimelinePanel in-app click destinations', () => {
	beforeEach( () => {
		jest
			.spyOn( analytics, 'recordReaderTracksEvent' )
			.mockImplementation( () => ( { type: '@@TEST/NOOP' } ) as never );
	} );

	afterEach( () => {
		nock.cleanAll();
		jest.restoreAllMocks();
	} );

	const TARGET_URI = 'at://did:plc:abc234567defghi234567jkl/app.bsky.feed.post/3kabcdefghijk';
	const QUOTED_URI = 'at://did:plc:def234567defghi234567jkl/app.bsky.feed.post/3kdefghijklmn';
	const PARENT_URI = 'at://did:plc:ghi234567defghi234567jkl/app.bsky.feed.post/3kghijklmnopq';

	function pageWithReplyAndQuote() {
		return {
			items: [
				makeFeedItem( {
					uri: TARGET_URI,
					reply_parent: {
						uri: PARENT_URI,
						author: {
							did: 'did:plc:ghi234567defghi234567jkl',
							handle: 'bob.bsky.social',
						},
					},
					embed: {
						type: 'quote',
						post: makeFeedItem( {
							uri: QUOTED_URI,
							bluesky_url: 'https://bsky.app/profile/jane.bsky.social/post/3kdefghijklmn',
						} ),
					},
					counts: { replies: 5, reposts: 0, likes: 0, quotes: 0 },
					bluesky_url: 'https://bsky.app/profile/jane.bsky.social/post/3kabcdefghijk',
				} ),
			],
			cursor: null,
		};
	}

	it( 'card-link timestamp uses the in-app thread URL', async () => {
		nock( 'https://public-api.wordpress.com' )
			.get( /\/connections\/7\/timeline/ )
			.query( true )
			.reply( 200, pageWithReplyAndQuote() );

		renderWithProvider( <TimelinePanel connection={ connection7 } />, {
			queryClient: makeQueryClient(),
		} );

		// Wait for posts to render by waiting for at least one link to appear
		await screen.findAllByRole( 'link' );
		const inAppLinks = screen
			.getAllByRole( 'link' )
			.filter( ( a ) => a.getAttribute( 'href' )?.startsWith( '/reader/atmosphere/7/thread/' ) );
		expect( inAppLinks.length ).toBeGreaterThanOrEqual( 1 );
	} );

	it( 'replies count is a real <a> to the in-app thread URL', async () => {
		nock( 'https://public-api.wordpress.com' )
			.get( /\/connections\/7\/timeline/ )
			.query( true )
			.reply( 200, pageWithReplyAndQuote() );

		renderWithProvider( <TimelinePanel connection={ connection7 } />, {
			queryClient: makeQueryClient(),
		} );

		const repliesLink = await screen.findByRole( 'link', { name: /replies/i } );
		expect( repliesLink ).toHaveAttribute(
			'href',
			expect.stringContaining( '/reader/atmosphere/7/thread/' )
		);
	} );

	it( 'reply-context preface is a real <a> to the parent thread URL', async () => {
		nock( 'https://public-api.wordpress.com' )
			.get( /\/connections\/7\/timeline/ )
			.query( true )
			.reply( 200, pageWithReplyAndQuote() );

		renderWithProvider( <TimelinePanel connection={ connection7 } />, {
			queryClient: makeQueryClient(),
		} );

		const link = await screen.findByRole( 'link', { name: /Replying to @bob/i } );
		expect( link ).toHaveAttribute(
			'href',
			expect.stringContaining( '/reader/atmosphere/7/thread/did:plc:ghi' )
		);
	} );

	it( 'quote embed routes in-app to the quoted post', async () => {
		nock( 'https://public-api.wordpress.com' )
			.get( /\/connections\/7\/timeline/ )
			.query( true )
			.reply( 200, pageWithReplyAndQuote() );

		renderWithProvider( <TimelinePanel connection={ connection7 } />, {
			queryClient: makeQueryClient(),
		} );

		await screen.findAllByRole( 'link' );
		const quoteLink = screen
			.getAllByRole( 'link' )
			.find( ( a ) => a.className.includes( 'embed-quote-link' ) );
		expect( quoteLink ).toHaveAttribute(
			'href',
			expect.stringContaining( '/reader/atmosphere/7/thread/did:plc:def' )
		);
	} );
} );

describe( 'TimelinePanel — slice 6 author chip + repost preface rewrites', () => {
	const REPOST_URI = 'at://did:plc:abc234567defghi234567jkl/app.bsky.feed.post/3kabcdefghijk';
	const reposterDid = 'did:plc:rep234567defghi234567jklab';
	const reposterHandle = 'joe.bsky.social';

	function pageWithRepost() {
		return {
			items: [
				makeFeedItem( {
					uri: REPOST_URI,
					reason: {
						type: 'repost',
						by: {
							did: reposterDid,
							handle: reposterHandle,
							display_name: 'Joe',
							avatar: null,
						},
						indexed_at: '2026-04-27T11:00:00Z',
					},
					bluesky_url: 'https://bsky.app/profile/alice.bsky.social/post/3kabcdefghijk',
				} ),
			],
			cursor: null,
		};
	}

	beforeEach( () => {
		jest
			.spyOn( analytics, 'recordReaderTracksEvent' )
			.mockImplementation( () => ( { type: '@@TEST/NOOP' } ) as never );
	} );

	afterEach( () => {
		nock.cleanAll();
		jest.restoreAllMocks();
	} );

	it( 'author chip <a> href is the in-app profile URL (same-tab, no target/rel)', async () => {
		nock( 'https://public-api.wordpress.com' )
			.get( /\/connections\/7\/timeline/ )
			.query( true )
			.reply( 200, pageWithRepost() );

		renderWithProvider( <TimelinePanel connection={ connection7 } />, {
			queryClient: makeQueryClient(),
		} );

		await screen.findAllByRole( 'link' );
		const authorLink = screen
			.getAllByRole( 'link' )
			.find(
				( a ) => a.getAttribute( 'href' ) === '/reader/atmosphere/7/profile/alice.bsky.social'
			);
		expect( authorLink ).toBeDefined();
		expect( authorLink ).not.toHaveAttribute( 'target' );
		expect( authorLink ).not.toHaveAttribute( 'rel' );
	} );

	it( 'repost preface name is a real <a> to the reposter in-app profile URL', async () => {
		nock( 'https://public-api.wordpress.com' )
			.get( /\/connections\/7\/timeline/ )
			.query( true )
			.reply( 200, pageWithRepost() );

		renderWithProvider( <TimelinePanel connection={ connection7 } />, {
			queryClient: makeQueryClient(),
		} );

		const repostLink = await screen.findByRole( 'link', { name: /Joe/i } );
		expect( repostLink ).toHaveAttribute(
			'href',
			`/reader/atmosphere/7/profile/${ reposterHandle }`
		);
		expect( repostLink ).not.toHaveAttribute( 'target' );
		expect( repostLink ).not.toHaveAttribute( 'rel' );
	} );

	it( 'fires author_clicked with destination=in_app after the rewrite', async () => {
		const spy = analytics.recordReaderTracksEvent as unknown as jest.Mock;
		nock( 'https://public-api.wordpress.com' )
			.get( /\/connections\/7\/timeline/ )
			.query( true )
			.reply( 200, pageWithRepost() );

		const user = userEvent.setup();
		renderWithProvider( <TimelinePanel connection={ connection7 } />, {
			queryClient: makeQueryClient(),
		} );

		await screen.findAllByRole( 'link' );
		const authorLink = screen
			.getAllByRole( 'link' )
			.find(
				( a ) => a.getAttribute( 'href' ) === '/reader/atmosphere/7/profile/alice.bsky.social'
			);
		await user.click( authorLink as HTMLElement );
		expect( spy ).toHaveBeenCalledWith(
			'calypso_reader_atmosphere_timeline_author_clicked',
			expect.objectContaining( {
				connection_id: 7,
				author_handle: 'alice.bsky.social',
				destination: 'in_app',
			} )
		);
	} );

	it( 'fires repost_author_clicked with destination=in_app when the reposter link is clicked', async () => {
		const spy = analytics.recordReaderTracksEvent as unknown as jest.Mock;
		nock( 'https://public-api.wordpress.com' )
			.get( /\/connections\/7\/timeline/ )
			.query( true )
			.reply( 200, pageWithRepost() );

		const user = userEvent.setup();
		renderWithProvider( <TimelinePanel connection={ connection7 } />, {
			queryClient: makeQueryClient(),
		} );

		const repostLink = await screen.findByRole( 'link', { name: /Joe/i } );
		await user.click( repostLink );
		expect( spy ).toHaveBeenCalledWith(
			'calypso_reader_atmosphere_timeline_repost_author_clicked',
			expect.objectContaining( {
				connection_id: 7,
				post_uri: REPOST_URI,
				reposter_did: reposterDid,
				reposter_handle: reposterHandle,
				destination: 'in_app',
			} )
		);
	} );
} );
