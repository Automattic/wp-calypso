/**
 * @jest-environment jsdom
 */
// `logToLogstash` fires a real HTTPS request. Mute it so the composer
// optimistic-mutation tests don't trigger an unmocked nock request.
jest.mock( 'calypso/lib/logstash', () => ( {
	logToLogstash: jest.fn(),
} ) );

import {
	PENDING_FEDIVERSE_POST_URI,
	readerFediverseKeys,
	type FediverseConnection,
	type FediverseFeedItem,
	type FediverseTimelinePage,
} from '@automattic/api-core';
import { QueryClient, type InfiniteData } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import { mockAllIsIntersecting } from 'react-intersection-observer/test-utils';
import * as analytics from 'calypso/state/reader/analytics/actions';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { TimelinePanel } from '../timeline-panel';

const connection: FediverseConnection = {
	id: 7,
	blog_id: 100,
	url: 'https://example.com',
	name: 'Example Blog',
	icon: '',
	webfinger: '@example@example.com',
};

function makeItem( overrides: Partial< FediverseFeedItem > = {} ): FediverseFeedItem {
	return {
		id: 'https://example.com/users/me/statuses/1',
		url: 'https://example.com/users/me/statuses/1',
		created_at: '2026-05-11T10:00:00Z',
		account: {
			id: 'https://example.com/users/me',
			username: 'me',
			acct: 'me',
			display_name: 'Me',
			avatar: null,
		},
		content: '<p>existing post</p>',
		spoiler_text: '',
		sensitive: false,
		language: null,
		in_reply_to_id: null,
		in_reply_to_account_id: null,
		boost: null,
		media: [],
		counts: { replies: 0, boosts: 0, favourites: 0 },
		...overrides,
	};
}

function seedCache( client: QueryClient, items: FediverseFeedItem[] ) {
	const key = readerFediverseKeys.timeline( 7 );
	const page: FediverseTimelinePage = { items, cursor: null };
	client.setQueryData< InfiniteData< FediverseTimelinePage > >( key, {
		pages: [ page ],
		pageParams: [ undefined ],
	} );
}

describe( 'TimelinePanel — composer optimistic placeholder', () => {
	beforeEach( () => {
		// `recordReaderTracksEvent` is a thunk that reads `state.reader.follows`.
		// Stub to a no-op action so dispatch() doesn't throw in the test store.
		jest
			.spyOn( analytics, 'recordReaderTracksEvent' )
			.mockImplementation( () => ( { type: '@@TEST/NOOP' } ) as never );
		// SocialFeedList uses an IntersectionObserver for sentinel pagination;
		// jsdom doesn't ship one. `mockAllIsIntersecting(false)` registers the
		// shim so the observe call doesn't blow up at mount.
		mockAllIsIntersecting( false );
	} );

	afterEach( () => {
		nock.cleanAll();
		jest.restoreAllMocks();
	} );

	it( 'renders an optimistic placeholder (sentinel id, empty url) alongside real items', async () => {
		// The mutation factory's `buildPlaceholderItem` stamps the placeholder
		// with `id: pendingUri` and `url: ''`. The timeline filter must let
		// the placeholder through — otherwise the optimistic prepend lands
		// in the cache but never reaches the UI.
		const placeholder = makeItem( {
			id: `${ PENDING_FEDIVERSE_POST_URI }#1`,
			url: '',
			content: '<p>just typed this</p>',
		} );
		const existing = makeItem( {
			id: 'https://example.com/users/me/statuses/0',
			url: 'https://example.com/users/me/statuses/0',
			content: '<p>older post</p>',
		} );

		const client = new QueryClient( {
			defaultOptions: { queries: { retry: false, staleTime: 60_000 } },
		} );
		seedCache( client, [ placeholder, existing ] );

		renderWithProvider( <TimelinePanel connection={ connection } />, {
			queryClient: client,
		} );

		await waitFor( () => expect( screen.getByText( 'just typed this' ) ).toBeVisible() );
		expect( screen.getByText( 'older post' ) ).toBeVisible();
	} );
} );
