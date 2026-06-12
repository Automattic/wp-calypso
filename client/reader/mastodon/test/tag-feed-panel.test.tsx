/**
 * @jest-environment jsdom
 */
import { QueryClient } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import * as analytics from 'calypso/state/reader/analytics/actions';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { MastodonTagFeedPanel } from '../tag-feed-panel';
import type { MastodonConnection } from '@automattic/api-core';

jest.mock( '@automattic/calypso-router', () => jest.fn() );

beforeAll( () => {
	global.IntersectionObserver = class IntersectionObserver {
		observe() {}
		unobserve() {}
		disconnect() {}
	} as unknown as typeof global.IntersectionObserver;
} );

afterAll( () => {
	// @ts-expect-error -- cleaning up the stub
	delete global.IntersectionObserver;
} );

const BASE = 'https://public-api.wordpress.com';

const connection: MastodonConnection = {
	id: 7,
	handle: '@me@mastodon.social',
	instance: 'mastodon.social',
	display_name: 'Me',
	avatar: null,
};

function makeQueryClient() {
	return new QueryClient( { defaultOptions: { queries: { retry: false } } } );
}

describe( 'MastodonTagFeedPanel', () => {
	beforeEach( () => {
		jest
			.spyOn( analytics, 'recordReaderTracksEvent' )
			.mockImplementation( () => ( { type: '@@TEST/NOOP' } ) as never );
	} );

	afterEach( () => {
		nock.cleanAll();
		jest.restoreAllMocks();
		window.history.replaceState( {}, '', '/' );
	} );

	it( 'renders the hashtag header and fires tag_feed_viewed once', async () => {
		nock( BASE )
			.get( '/wpcom/v2/reader/mastodon/connections/7/tag/rust/feed' )
			.reply( 200, { items: [], cursor: null } );

		renderWithProvider( <MastodonTagFeedPanel connection={ connection } hashtag="rust" />, {
			queryClient: makeQueryClient(),
		} );

		await waitFor( () => expect( screen.getByRole( 'heading', { name: '#rust' } ) ).toBeVisible() );
		await waitFor( () => {
			const calls = ( analytics.recordReaderTracksEvent as unknown as jest.Mock ).mock.calls.filter(
				( c ) => c[ 0 ] === 'calypso_reader_mastodon_tag_feed_viewed'
			);
			expect( calls ).toHaveLength( 1 );
			expect( calls[ 0 ][ 1 ] ).toMatchObject( {
				connection_id: 7,
				hashtag: 'rust',
				initial_filter: 'all',
			} );
		} );
	} );

	it( 'renders the count line when the backend embeds tag.count', async () => {
		nock( BASE )
			.get( '/wpcom/v2/reader/mastodon/connections/7/tag/rust/feed' )
			.reply( 200, {
				items: [],
				cursor: null,
				tag: { name: 'rust', count: 42 },
			} );

		renderWithProvider( <MastodonTagFeedPanel connection={ connection } hashtag="rust" />, {
			queryClient: makeQueryClient(),
		} );

		await waitFor( () => {
			expect( screen.getByRole( 'heading', { name: '#rust' } ) ).toBeVisible();
			expect( screen.getByText( /42/ ) ).toBeVisible();
		} );
	} );

	it( 'renders a "View on Mastodon" link when the backend embeds tag.url', async () => {
		nock( BASE )
			.get( '/wpcom/v2/reader/mastodon/connections/7/tag/rust/feed' )
			.reply( 200, {
				items: [],
				cursor: null,
				tag: { name: 'rust', url: 'https://mastodon.social/tags/rust' },
			} );

		renderWithProvider( <MastodonTagFeedPanel connection={ connection } hashtag="rust" />, {
			queryClient: makeQueryClient(),
		} );

		const link = await screen.findByRole( 'link', { name: /View on Mastodon/ } );
		expect( link ).toHaveAttribute( 'href', 'https://mastodon.social/tags/rust' );
		expect( link ).toHaveAttribute( 'target', '_blank' );
		// Assert the security tokens are present without locking to the exact ordering.
		const rel = ( link.getAttribute( 'rel' ) ?? '' ).split( /\s+/ );
		expect( rel ).toEqual( expect.arrayContaining( [ 'noopener', 'noreferrer' ] ) );
	} );

	it( 'omits the external link when tag.url is not provided', async () => {
		nock( BASE )
			.get( '/wpcom/v2/reader/mastodon/connections/7/tag/rust/feed' )
			.reply( 200, { items: [], cursor: null, tag: { name: 'rust', count: 1 } } );

		renderWithProvider( <MastodonTagFeedPanel connection={ connection } hashtag="rust" />, {
			queryClient: makeQueryClient(),
		} );

		await waitFor( () => expect( screen.getByRole( 'heading', { name: '#rust' } ) ).toBeVisible() );
		expect( screen.queryByRole( 'link', { name: /View on Mastodon/ } ) ).toBeNull();
	} );

	it( 'rejects non-https tag.url values (defense-in-depth)', async () => {
		nock( BASE )
			.get( '/wpcom/v2/reader/mastodon/connections/7/tag/rust/feed' )
			.reply( 200, {
				items: [],
				cursor: null,
				tag: { name: 'rust', url: 'javascript:alert(1)' },
			} );

		renderWithProvider( <MastodonTagFeedPanel connection={ connection } hashtag="rust" />, {
			queryClient: makeQueryClient(),
		} );

		await waitFor( () => expect( screen.getByRole( 'heading', { name: '#rust' } ) ).toBeVisible() );
		expect( screen.queryByRole( 'link', { name: /View on Mastodon/ } ) ).toBeNull();
	} );

	it( 'flows ?tab=media through to the feed query as only_media=true', async () => {
		window.history.replaceState( {}, '', '/reader/mastodon/7/tag/rust?tab=media' );
		const feedScope = nock( BASE )
			.get( '/wpcom/v2/reader/mastodon/connections/7/tag/rust/feed' )
			.query( { only_media: 'true' } )
			.reply( 200, { items: [], cursor: null } );

		renderWithProvider( <MastodonTagFeedPanel connection={ connection } hashtag="rust" />, {
			queryClient: makeQueryClient(),
		} );

		await waitFor( () => expect( feedScope.isDone() ).toBe( true ) );
	} );
} );
