/**
 * @jest-environment jsdom
 */
import { screen, waitFor } from '@testing-library/react';
import { logToLogstash } from 'calypso/lib/logstash';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { SocialSpotlight, type SpotlightConnection } from '../social-spotlight';
import type {
	AtmosphereFeedItem,
	AtmosphereTimelinePage,
	FediverseFeedItem,
	FediverseTimelinePage,
	MastodonFeedItem,
	MastodonTimelinePage,
} from '@automattic/api-core';

jest.mock( 'calypso/lib/logstash', () => ( { logToLogstash: jest.fn() } ) );

const mockedLogToLogstash = logToLogstash as jest.MockedFunction< typeof logToLogstash >;

const mockAtmosphereTimeline = jest.fn();
const mockMastodonTimeline = jest.fn();
const mockFediverseTimeline = jest.fn();

jest.mock( '@automattic/api-core', () => {
	const actual = jest.requireActual( '@automattic/api-core' );
	return {
		...actual,
		getTimeline: ( ...args: unknown[] ) => mockAtmosphereTimeline( ...args ),
		getMastodonTimeline: ( ...args: unknown[] ) => mockMastodonTimeline( ...args ),
		getFediverseTimeline: ( ...args: unknown[] ) => mockFediverseTimeline( ...args ),
	};
} );

function makeAtmosphereItem( overrides: Partial< AtmosphereFeedItem > = {} ): AtmosphereFeedItem {
	return {
		uri: 'at://did:plc:abc/app.bsky.feed.post/1',
		cid: 'bafy1',
		permalink: 'https://bsky.app/profile/alice.bsky.social/post/1',
		text: 'Bluesky plain-text body',
		html: '<p>Bluesky plain-text body</p>',
		created_at: '2026-05-20T12:00:00Z',
		indexed_at: null,
		lang: [ 'en' ],
		author: {
			id: 'did:plc:abc',
			handle: 'alice.bsky.social',
			display_name: 'Alice',
			avatar: null,
			profile_url: 'https://bsky.app/profile/alice.bsky.social',
		},
		reply_parent: null,
		reply_root: null,
		reason: null,
		embed: null,
		counts: { replies: 0, reposts: 10, likes: 50, quotes: 0 },
		...overrides,
	} as AtmosphereFeedItem;
}

function makeMastodonItem( overrides: Partial< MastodonFeedItem > = {} ): MastodonFeedItem {
	return {
		id: '1',
		url: 'https://mas.to/@carol/1',
		created_at: '2026-05-20T12:00:00Z',
		account: {
			id: '99',
			username: 'carol',
			acct: 'carol',
			display_name: 'Carol',
			avatar: null,
		},
		content: '<p>Mastodon body content</p>',
		spoiler_text: '',
		sensitive: false,
		language: 'en',
		in_reply_to_id: null,
		in_reply_to_account_id: null,
		boost: null,
		media: [],
		counts: { replies: 0, boosts: 1, favourites: 3 },
		viewer: { favourited: false, reblogged: false },
		...overrides,
	} as MastodonFeedItem;
}

function makeFediverseItem( overrides: Partial< FediverseFeedItem > = {} ): FediverseFeedItem {
	return {
		id: 'https://example.social/users/bob/statuses/1',
		url: 'https://example.social/@bob/1',
		created_at: '2026-05-20T12:00:00Z',
		account: {
			id: 'https://example.social/users/bob',
			username: 'bob',
			acct: 'bob@example.social',
			display_name: 'Bob',
			avatar: null,
		},
		content: '<p>Fediverse <strong>HTML</strong> body &amp; entities</p>',
		spoiler_text: '',
		sensitive: false,
		language: 'en',
		in_reply_to_id: null,
		in_reply_to_account_id: null,
		boost: null,
		media: [],
		counts: { replies: 0, boosts: 5, favourites: 20 },
		viewer: { favourited: false, reblogged: false },
		...overrides,
	} as FediverseFeedItem;
}

describe( 'SocialSpotlight', () => {
	beforeEach( () => {
		mockAtmosphereTimeline.mockReset();
		mockMastodonTimeline.mockReset();
		mockFediverseTimeline.mockReset();
		mockedLogToLogstash.mockClear();
		mockMastodonTimeline.mockResolvedValue( {
			items: [],
			cursor: null,
		} as MastodonTimelinePage );
	} );

	it( 'shows card body text from post.text for ATmosphere items', async () => {
		mockAtmosphereTimeline.mockResolvedValue( {
			items: [ makeAtmosphereItem() ],
			cursor: null,
		} as AtmosphereTimelinePage );
		mockFediverseTimeline.mockResolvedValue( {
			items: [],
			cursor: null,
		} as FediverseTimelinePage );

		const connections: SpotlightConnection[] = [ { protocol: 'atmosphere', id: 1 } ];
		renderWithProvider( <SocialSpotlight connections={ connections } /> );

		expect( await screen.findByText( 'Bluesky plain-text body' ) ).toBeVisible();
	} );

	it( 'derives card body text from post.html when post.text is empty (Fediverse)', async () => {
		mockAtmosphereTimeline.mockResolvedValue( {
			items: [],
			cursor: null,
		} as AtmosphereTimelinePage );
		mockFediverseTimeline.mockResolvedValue( {
			items: [ makeFediverseItem() ],
			cursor: null,
		} as FediverseTimelinePage );

		const connections: SpotlightConnection[] = [
			{ protocol: 'fediverse', id: 2, host: 'example.social' },
		];
		renderWithProvider( <SocialSpotlight connections={ connections } /> );

		// Tags stripped, HTML entities decoded, content surfaced in the card.
		expect( await screen.findByText( /Fediverse HTML body & entities/ ) ).toBeVisible();
	} );

	it( 'derives card body text from post.html when post.text is empty (Mastodon)', async () => {
		mockAtmosphereTimeline.mockResolvedValue( {
			items: [],
			cursor: null,
		} as AtmosphereTimelinePage );
		mockMastodonTimeline.mockResolvedValue( {
			items: [ makeMastodonItem() ],
			cursor: null,
		} as MastodonTimelinePage );
		mockFediverseTimeline.mockResolvedValue( {
			items: [],
			cursor: null,
		} as FediverseTimelinePage );

		const connections: SpotlightConnection[] = [
			{ protocol: 'mastodon', id: 3, instance: 'mas.to' },
		];
		renderWithProvider( <SocialSpotlight connections={ connections } /> );

		expect( await screen.findByText( 'Mastodon body content' ) ).toBeVisible();
	} );

	it( 'renders the layout-stable skeleton while queries are pending', () => {
		// Returning a never-resolving promise keeps the query in pending state.
		mockAtmosphereTimeline.mockReturnValue( new Promise( () => {} ) );

		const connections: SpotlightConnection[] = [ { protocol: 'atmosphere', id: 1 } ];
		const { container } = renderWithProvider( <SocialSpotlight connections={ connections } /> );

		expect( container.querySelector( '.social-spotlight-skeleton__card' ) ).not.toBeNull();
	} );

	it( 'logs a failed upstream once, not on every re-render', async () => {
		mockAtmosphereTimeline.mockRejectedValue( new Error( 'boom' ) );
		mockFediverseTimeline.mockResolvedValue( {
			items: [],
			cursor: null,
		} as FediverseTimelinePage );

		const connections: SpotlightConnection[] = [ { protocol: 'atmosphere', id: 1 } ];
		const { rerender } = renderWithProvider( <SocialSpotlight connections={ connections } /> );

		await waitFor( () => {
			expect( mockedLogToLogstash ).toHaveBeenCalledTimes( 1 );
		} );
		expect( mockedLogToLogstash ).toHaveBeenCalledWith(
			expect.objectContaining( {
				extra: expect.objectContaining( {
					type: 'reader_social_spotlight_fetch_failed',
					protocol: 'atmosphere',
					connection_id: 1,
				} ),
			} )
		);

		// Re-render with the same connections. The error state is unchanged,
		// so the effect must not re-fire and `loggedErrorKeys` must dedupe.
		rerender( <SocialSpotlight connections={ connections } /> );
		rerender( <SocialSpotlight connections={ connections } /> );

		expect( mockedLogToLogstash ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'collapses to nothing when all items score 0', async () => {
		mockAtmosphereTimeline.mockResolvedValue( {
			items: [
				makeAtmosphereItem( {
					counts: { replies: 0, reposts: 0, likes: 0, quotes: 0 },
				} ),
			],
			cursor: null,
		} as AtmosphereTimelinePage );

		const connections: SpotlightConnection[] = [ { protocol: 'atmosphere', id: 1 } ];
		const { container } = renderWithProvider( <SocialSpotlight connections={ connections } /> );

		await waitFor( () => {
			expect( container.querySelector( '.social-spotlight' ) ).toBeNull();
		} );
	} );
} );
