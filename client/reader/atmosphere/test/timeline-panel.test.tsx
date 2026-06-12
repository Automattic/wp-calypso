/**
 * @jest-environment jsdom
 */
import { readerAtmosphereKeys } from '@automattic/api-core';
import { QueryClient } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { useState } from 'react';
import { mockAllIsIntersecting } from 'react-intersection-observer/test-utils';
import { ComposerModal, ComposerProvider } from 'calypso/reader/social/composer';
import * as analytics from 'calypso/state/reader/analytics/actions';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { atmosphereComposerConfig } from '../composer-config';
import { TimelinePanel } from '../timeline-panel';
import type {
	AtmosphereConnection,
	AtmosphereFeedItem,
	AtmosphereTimelinePage,
} from '@automattic/api-core';
import type { InfiniteData } from '@tanstack/react-query';

jest.mock( 'calypso/lib/logstash', () => ( {
	logToLogstash: jest.fn(),
} ) );

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

// Pre-seed the connection-details cache (keyed by id) so the panel's
// useConnectionQuery call is a cache hit and never issues a network
// request the test isn't nocking. Tests that care about the avatar
// can override the seeded data per-test.
function makeQueryClient() {
	const client = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
	client.setQueryData( readerAtmosphereKeys.connection( 42 ), {
		did: 'did:plc:abc',
		handle: 'alice.bsky.social',
		display_name: 'Alice',
		description: '',
		avatar: null,
		banner: null,
		counts: { followers: 0, follows: 0, posts: 0 },
	} );
	client.setQueryData( readerAtmosphereKeys.connection( 7 ), {
		did: 'did:plc:abc234567defghi234567jklab',
		handle: 'alice.bsky.social',
		display_name: 'Alice',
		description: '',
		avatar: null,
		banner: null,
		counts: { followers: 0, follows: 0, posts: 0 },
	} );
	client.setQueryData( readerAtmosphereKeys.connection( 99 ), {
		did: 'did:plc:other',
		handle: 'bob.bsky.social',
		display_name: 'Bob',
		description: '',
		avatar: null,
		banner: null,
		counts: { followers: 0, follows: 0, posts: 0 },
	} );
	return client;
}

describe( 'TimelinePanel', () => {
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
		inner.bluesky_url = 'https://bsky.app/profile/alice.bsky.social/post/quoted';
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
		const quoteLink = screen
			.getAllByRole( 'link' )
			.find(
				( link ) =>
					link.getAttribute( 'href' ) === 'https://bsky.app/profile/alice.bsky.social/post/quoted'
			);
		expect( quoteLink ).toBeDefined();
		await user.click( quoteLink as HTMLElement );
		expect( spy ).toHaveBeenCalledWith(
			'calypso_reader_atmosphere_timeline_quote_clicked',
			expect.objectContaining( {
				connection_id: 42,
				parent_uri: 'at://abc',
				quoted_uri: 'at://quoted',
			} )
		);
	} );

	it( 'click on like button fires POST, updates count and pressed state', async () => {
		nock( BASE )
			.get( PATH )
			.query( {} )
			.reply( 200, {
				items: [
					{
						...makePost( 'at://did:plc:author/app.bsky.feed.post/3kabc', 'likeable post' ),
						cid: 'bafy-cid',
						counts: { replies: 0, reposts: 0, likes: 5, quotes: 0 },
						viewer: { like: null, repost: null },
					},
				],
				cursor: null,
			} );
		nock( BASE )
			.post( '/wpcom/v2/reader/atmosphere/connections/42/likes', {
				post_uri: 'at://did:plc:author/app.bsky.feed.post/3kabc',
				post_cid: 'bafy-cid',
			} )
			.reply( 200, {
				like: {
					uri: 'at://did:plc:caller/app.bsky.feed.like/3krkeyrkeyrke',
					cid: 'bafy-like-cid',
					rkey: '3krkeyrkeyrke',
				},
			} );

		const user = userEvent.setup();
		renderWithProvider( <TimelinePanel connection={ connection } />, {
			queryClient: makeQueryClient(),
		} );
		const button = await screen.findByRole( 'button', { name: /like, 5 likes/i } );
		expect( button ).toHaveTextContent( '5' );

		await user.click( button );

		await waitFor( () => expect( screen.getByRole( 'button', { name: /like, 6 likes/i } ) ) );
		expect( screen.getByRole( 'button', { name: /like, 6 likes/i } ) ).toHaveAttribute(
			'aria-pressed',
			'true'
		);
		expect( screen.getByRole( 'button', { name: /like, 6 likes/i } ) ).toHaveTextContent( '6' );
		await waitFor( () => expect( nock.isDone() ).toBe( true ) );
	} );

	it( 'opens the repost menu, fires POST on Repost click, and toggles directly on un-repost', async () => {
		const POST_URI = 'at://did:plc:author/app.bsky.feed.post/3krepost';
		const REPOST_URI = 'at://did:plc:caller/app.bsky.feed.repost/3krrkeyrkeyrk';

		nock( BASE )
			.get( PATH )
			.query( {} )
			.reply( 200, {
				items: [
					{
						...makePost( POST_URI, 'repostable post' ),
						cid: 'bafy-cid',
						counts: { replies: 0, reposts: 5, likes: 0, quotes: 0 },
						viewer: { like: null, repost: null },
					},
				],
				cursor: null,
			} );
		nock( BASE )
			.post( '/wpcom/v2/reader/atmosphere/connections/42/reposts', {
				post_uri: POST_URI,
				post_cid: 'bafy-cid',
			} )
			.reply( 200, {
				repost: { uri: REPOST_URI, cid: 'bafy-r-cid', rkey: '3krrkeyrkeyrk' },
			} );

		const user = userEvent.setup();
		renderWithProvider( <TimelinePanel connection={ connection } />, {
			queryClient: makeQueryClient(),
		} );

		const trigger = await screen.findByRole( 'button', { name: /repost, 5 reposts/i } );
		expect( trigger ).toHaveAttribute( 'aria-haspopup', 'menu' );
		await user.click( trigger );

		await user.click( await screen.findByRole( 'menuitem', { name: 'Repost' } ) );

		const updated = await screen.findByRole( 'button', { name: /undo repost, 6 reposts/i } );
		expect( updated ).toHaveAttribute( 'aria-pressed', 'true' );

		nock( BASE )
			.delete( '/wpcom/v2/reader/atmosphere/connections/42/reposts/3krrkeyrkeyrk' )
			.reply( 204 );

		await user.click( updated );
		expect( screen.queryByRole( 'menuitem', { name: 'Repost' } ) ).toBeNull();

		const reverted = await screen.findByRole( 'button', { name: /repost, 5 reposts/i } );
		expect( reverted ).toHaveAttribute( 'aria-haspopup', 'menu' );
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
			.find(
				( a ) =>
					a
						.getAttribute( 'href' )
						?.includes(
							'/reader/atmosphere/7/thread/did:plc:def234567defghi234567jkl/3kdefghijklmn'
						)
			);
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

describe( 'TimelinePanel — quote composer integration', () => {
	beforeEach( () => {
		jest
			.spyOn( analytics, 'recordReaderTracksEvent' )
			.mockImplementation( () => ( { type: '@@TEST/NOOP' } ) as never );
	} );

	afterEach( () => {
		nock.cleanAll();
		jest.restoreAllMocks();
	} );

	it( 'opens the composer in quote mode when the quotes count is clicked', async () => {
		const queryClient = makeQueryClient();
		queryClient.setQueryData( readerAtmosphereKeys.timeline( 42 ), {
			pages: [
				{
					items: [
						{
							...makePost( 'at://parent', 'quotable post' ),
							cid: 'pcid',
							counts: { replies: 0, reposts: 0, likes: 0, quotes: 3 },
						},
					],
					cursor: null,
				},
			],
			pageParams: [ undefined ],
		} );

		const user = userEvent.setup();
		renderWithProvider(
			<ComposerProvider connectionId={ 42 } config={ atmosphereComposerConfig }>
				<TimelinePanel connection={ connection } />
				<ComposerModal />
			</ComposerProvider>,
			{ queryClient }
		);

		const repostButton = await screen.findByRole( 'button', { name: /repost, 3 reposts/i } );
		await user.click( repostButton );
		const quoteItem = await screen.findByRole( 'menuitem', { name: 'Quote post' } );
		await user.click( quoteItem );
		expect( await screen.findByRole( 'dialog', { name: /quote post/i } ) ).toBeVisible();
	} );
} );

describe( 'TimelinePanel — reply composer integration', () => {
	beforeEach( () => {
		jest
			.spyOn( analytics, 'recordReaderTracksEvent' )
			.mockImplementation( () => ( { type: '@@TEST/NOOP' } ) as never );
	} );

	afterEach( () => {
		nock.cleanAll();
		jest.restoreAllMocks();
	} );

	function makeOnePagePayload(
		uri: string,
		cid: string,
		counts: { replies: number; reposts: number; likes: number; quotes: number }
	): InfiniteData< AtmosphereTimelinePage > {
		const item: AtmosphereFeedItem = {
			...makePost( uri, 'parent post' ),
			cid,
			counts,
		};
		return {
			pages: [ { items: [ item ], cursor: null } ],
			pageParams: [ undefined ],
		};
	}

	it( 'opens the reply composer from the replies count and posts on submit', async () => {
		const queryClient = makeQueryClient();
		queryClient.setQueryData(
			readerAtmosphereKeys.timeline( 42 ),
			makeOnePagePayload( 'at://parent', 'pcid', {
				replies: 1,
				reposts: 0,
				likes: 0,
				quotes: 0,
			} )
		);

		nock( BASE )
			.post( '/wpcom/v2/reader/atmosphere/connections/42/posts', {
				text: 'great post',
				reply: {
					root: { uri: 'at://parent', cid: 'pcid' },
					parent: { uri: 'at://parent', cid: 'pcid' },
				},
			} )
			.reply( 200, { post: { uri: 'at://new', cid: 'newcid', rkey: 'r' } } );

		const user = userEvent.setup();
		renderWithProvider(
			<ComposerProvider connectionId={ 42 } config={ atmosphereComposerConfig }>
				<TimelinePanel connection={ connection } />
				<ComposerModal />
			</ComposerProvider>,
			{ queryClient }
		);

		await user.click( await screen.findByRole( 'button', { name: /reply/i } ) );
		expect( await screen.findByRole( 'dialog', { name: /reply/i } ) ).toBeVisible();
		await user.type( screen.getByRole( 'textbox' ), 'great post' );
		await user.click( screen.getByRole( 'button', { name: 'Post' } ) );

		await waitFor( () => expect( nock.isDone() ).toBe( true ) );
		await waitFor( () => expect( screen.queryByRole( 'dialog' ) ).toBeNull() );

		const timeline = queryClient.getQueryData< InfiniteData< AtmosphereTimelinePage > >(
			readerAtmosphereKeys.timeline( 42 )
		);
		expect( timeline?.pages[ 0 ].items[ 0 ].counts.replies ).toBe( 2 );
	} );
} );

describe( 'TimelinePanel — reply composer errors', () => {
	beforeEach( () => {
		jest
			.spyOn( analytics, 'recordReaderTracksEvent' )
			.mockImplementation( () => ( { type: '@@TEST/NOOP' } ) as never );
	} );

	afterEach( () => {
		nock.cleanAll();
		jest.restoreAllMocks();
	} );

	function makeOnePagePayload(
		uri: string,
		cid: string,
		counts: { replies: number; reposts: number; likes: number; quotes: number }
	): InfiniteData< AtmosphereTimelinePage > {
		const item: AtmosphereFeedItem = {
			...makePost( uri, 'parent post' ),
			cid,
			counts,
		};
		return {
			pages: [ { items: [ item ], cursor: null } ],
			pageParams: [ undefined ],
		};
	}

	const ERROR_CASES = [
		{
			status: 400,
			code: 'atmosphere_bad_request',
			kind: 'bad_request',
			copy: /shorten/i,
		},
		{
			status: 401,
			code: 'atmosphere_auth_required',
			kind: 'auth_required',
			copy: /Bluesky connection/i,
		},
		{
			status: 429,
			code: 'atmosphere_rate_limited',
			kind: 'rate_limited',
			copy: /posting too quickly/i,
		},
		{
			status: 502,
			code: 'atmosphere_upstream_unavailable',
			kind: 'upstream_unavailable',
			copy: /taking longer/i,
		},
	] as const;

	it.each( ERROR_CASES )(
		'maps HTTP $status to kind $kind, keeps modal + draft, and fires _error_shown',
		async ( { status, code, kind, copy } ) => {
			const recordSpy = analytics.recordReaderTracksEvent as unknown as jest.Mock;

			const queryClient = makeQueryClient();
			queryClient.setQueryData(
				readerAtmosphereKeys.timeline( 42 ),
				makeOnePagePayload( 'at://parent', 'pcid', {
					replies: 1,
					reposts: 0,
					likes: 0,
					quotes: 0,
				} )
			);

			nock( BASE )
				.post( '/wpcom/v2/reader/atmosphere/connections/42/posts' )
				.reply( status, { error: code } );

			const user = userEvent.setup();
			renderWithProvider(
				<ComposerProvider connectionId={ 42 } config={ atmosphereComposerConfig }>
					<TimelinePanel connection={ connection } />
					<ComposerModal />
				</ComposerProvider>,
				{ queryClient }
			);

			await user.click( await screen.findByRole( 'button', { name: /reply/i } ) );
			await user.type( screen.getByRole( 'textbox' ), 'hi' );
			await user.click( screen.getByRole( 'button', { name: 'Post' } ) );

			await screen.findByText( copy );
			expect( screen.getByRole( 'dialog' ) ).toBeVisible();
			expect( screen.getByRole( 'textbox' ) ).toHaveValue( 'hi' );

			await waitFor( () =>
				expect( recordSpy ).toHaveBeenCalledWith(
					'calypso_reader_atmosphere_reply_error_shown',
					expect.objectContaining( {
						connection_id: 42,
						parent_uri: 'at://parent',
						error_kind: kind,
					} )
				)
			);
		}
	);

	it( 'auth_required surfaces a connection-error message with no reconnect link', async () => {
		const queryClient = makeQueryClient();
		queryClient.setQueryData(
			readerAtmosphereKeys.timeline( 42 ),
			makeOnePagePayload( 'at://parent', 'pcid', {
				replies: 1,
				reposts: 0,
				likes: 0,
				quotes: 0,
			} )
		);

		nock( BASE )
			.post( '/wpcom/v2/reader/atmosphere/connections/42/posts' )
			.reply( 401, { error: 'atmosphere_auth_required' } );

		const user = userEvent.setup();
		renderWithProvider(
			<ComposerProvider connectionId={ 42 } config={ atmosphereComposerConfig }>
				<TimelinePanel connection={ connection } />
				<ComposerModal />
			</ComposerProvider>,
			{ queryClient }
		);

		await user.click( await screen.findByRole( 'button', { name: /reply/i } ) );
		await user.type( screen.getByRole( 'textbox' ), 'hi' );
		await user.click( screen.getByRole( 'button', { name: 'Post' } ) );

		expect( await screen.findByText( /Bluesky connection/i ) ).toBeVisible();
		expect( screen.queryByRole( 'link', { name: /reconnect/i } ) ).toBeNull();
	} );
} );

describe( 'TimelinePanel — compose pill', () => {
	// Match either a curly or straight apostrophe — the production placeholder
	// uses the curly form (CLAUDE.md preserves it).
	const PLACEHOLDER_RE = /what['’]s up/i;

	beforeEach( () => {
		jest
			.spyOn( analytics, 'recordReaderTracksEvent' )
			.mockImplementation( () => ( { type: '@@TEST/NOOP' } ) as never );
	} );

	afterEach( () => {
		nock.cleanAll();
		jest.restoreAllMocks();
	} );

	it( 'renders the compose pill at the top of the feed and opens the standalone modal on click', async () => {
		nock( BASE ).get( PATH ).query( {} ).reply( 200, { items: [], cursor: null } );

		const user = userEvent.setup();
		renderWithProvider(
			<ComposerProvider connectionId={ 42 } config={ atmosphereComposerConfig }>
				<TimelinePanel connection={ connection } />
				<ComposerModal />
			</ComposerProvider>,
			{ queryClient: makeQueryClient() }
		);

		const pill = await screen.findByRole( 'button', { name: PLACEHOLDER_RE } );
		expect( pill ).toBeVisible();

		await user.click( pill );

		expect( await screen.findByRole( 'dialog', { name: 'New post' } ) ).toBeVisible();
	} );

	it( 'renders the pill avatar from the connection-details cache, not the list-endpoint shape', async () => {
		nock( BASE ).get( PATH ).query( {} ).reply( 200, { items: [], cursor: null } );

		// Override the seeded connection-details so avatar is non-null.
		const queryClient = makeQueryClient();
		const detailsAvatar = 'https://cdn.example/timeline-avatar.jpg';
		queryClient.setQueryData( readerAtmosphereKeys.connection( 42 ), {
			did: 'did:plc:abc',
			handle: 'alice.bsky.social',
			display_name: 'Alice',
			description: '',
			avatar: detailsAvatar,
			banner: null,
			counts: { followers: 0, follows: 0, posts: 0 },
		} );

		const { container } = renderWithProvider(
			<ComposerProvider connectionId={ 42 } config={ atmosphereComposerConfig }>
				<TimelinePanel connection={ connection } />
			</ComposerProvider>,
			{ queryClient }
		);

		await screen.findByRole( 'button', { name: PLACEHOLDER_RE } );

		const avatarImg = container.querySelector< HTMLImageElement >( '.social-compose-pill__avatar' );
		expect( avatarImg?.tagName ).toBe( 'IMG' );
		expect( avatarImg?.getAttribute( 'src' ) ).toBe( detailsAvatar );
	} );
} );

describe( 'TimelinePanel — reply composer optimistic + stickiness', () => {
	beforeEach( () => {
		jest
			.spyOn( analytics, 'recordReaderTracksEvent' )
			.mockImplementation( () => ( { type: '@@TEST/NOOP' } ) as never );
	} );

	afterEach( () => {
		nock.cleanAll();
		jest.restoreAllMocks();
	} );

	function makeOnePagePayload(
		uri: string,
		cid: string,
		counts: { replies: number; reposts: number; likes: number; quotes: number }
	): InfiniteData< AtmosphereTimelinePage > {
		const item: AtmosphereFeedItem = {
			...makePost( uri, 'parent post' ),
			cid,
			counts,
		};
		return {
			pages: [ { items: [ item ], cursor: null } ],
			pageParams: [ undefined ],
		};
	}

	it( 'rolls back the optimistic counts.replies bump on 502', async () => {
		const queryClient = makeQueryClient();
		queryClient.setQueryData(
			readerAtmosphereKeys.timeline( 42 ),
			makeOnePagePayload( 'at://parent', 'pcid', {
				replies: 1,
				reposts: 0,
				likes: 0,
				quotes: 0,
			} )
		);

		nock( BASE )
			.post( '/wpcom/v2/reader/atmosphere/connections/42/posts' )
			.reply( 502, { error: 'atmosphere_upstream_unavailable' } );

		const user = userEvent.setup();
		renderWithProvider(
			<ComposerProvider connectionId={ 42 } config={ atmosphereComposerConfig }>
				<TimelinePanel connection={ connection } />
				<ComposerModal />
			</ComposerProvider>,
			{ queryClient }
		);

		await user.click( await screen.findByRole( 'button', { name: /reply/i } ) );
		await user.type( screen.getByRole( 'textbox' ), 'hi' );
		await user.click( screen.getByRole( 'button', { name: 'Post' } ) );

		await screen.findByText( /taking longer/i );

		await waitFor( () => {
			const timeline = queryClient.getQueryData< InfiniteData< AtmosphereTimelinePage > >(
				readerAtmosphereKeys.timeline( 42 )
			);
			expect( timeline?.pages[ 0 ].items[ 0 ].counts.replies ).toBe( 1 );
		} );
	} );

	it( 'submits to the connection that was active when the composer opened, even if the active connection changes mid-flight', async () => {
		// Seed the timeline cache for connection 42 so the parent post is rendered.
		const queryClient = makeQueryClient();
		queryClient.setQueryData(
			readerAtmosphereKeys.timeline( 42 ),
			makeOnePagePayload( 'at://parent', 'pcid', {
				replies: 1,
				reposts: 0,
				likes: 0,
				quotes: 0,
			} )
		);

		// Only mock /connections/42/posts. If the harness submits to /99 the
		// request will not be matched and the test will fail.
		const scope = nock( BASE )
			.post( '/wpcom/v2/reader/atmosphere/connections/42/posts' )
			.reply( 200, { post: { uri: 'at://new', cid: 'newcid', rkey: 'r' } } );

		const connection99: AtmosphereConnection = {
			id: 99,
			did: 'did:plc:other',
			handle: 'bob.bsky.social',
			display_name: 'Bob',
			avatar: null,
		};

		function ConnectionSwitchHarness() {
			const [ id, setId ] = useState( 42 );
			const activeConnection = id === 42 ? connection : connection99;
			return (
				<>
					<button onClick={ () => setId( 99 ) }>switch</button>
					<ComposerProvider connectionId={ id } config={ atmosphereComposerConfig }>
						<TimelinePanel connection={ activeConnection } />
						<ComposerModal />
					</ComposerProvider>
				</>
			);
		}

		const user = userEvent.setup();
		renderWithProvider( <ConnectionSwitchHarness />, { queryClient } );

		// Open the composer while connection 42 is active. The composer
		// snapshots `connectionId: 42` into its mode at this point.
		await user.click( await screen.findByRole( 'button', { name: /reply/i } ) );
		expect( await screen.findByRole( 'dialog', { name: /reply/i } ) ).toBeVisible();

		await user.type( screen.getByRole( 'textbox' ), 'hi' );

		// Switch the provider's connectionId to 99 mid-flight. The modal
		// stays open with its snapshotted 42.
		await user.click( screen.getByText( 'switch' ) );
		expect( screen.getByRole( 'dialog', { name: /reply/i } ) ).toBeVisible();

		await user.click( screen.getByRole( 'button', { name: 'Post' } ) );

		// nock will only match if the request went to /connections/42/posts.
		await waitFor( () => expect( scope.isDone() ).toBe( true ) );
	} );
} );
