/**
 * @jest-environment jsdom
 */
// `logToLogstash` fires a real HTTPS request. Mute it so error tests don't
// trip an unmocked nock request.
jest.mock( 'calypso/lib/logstash', () => ( {
	logToLogstash: jest.fn(),
} ) );

import { QueryClient } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { FollowersView } from '../followers-view';
import type React from 'react';

// `ReaderMain` mounts `<sync-reader-follows>`, which selects from a Redux
// branch the test store doesn't seed. Stub to a passthrough.
jest.mock(
	'calypso/reader/components/reader-main',
	() =>
		function ReaderMain( { children }: { children: React.ReactNode } ) {
			return <div>{ children }</div>;
		}
);

jest.mock( 'calypso/components/data/document-head', () => () => null );

const BASE = 'https://public-api.wordpress.com';
const CONNECTIONS_URL = '/wpcom/v2/reader/fediverse/connections';
const PROFILE_URL = '/wpcom/v2/reader/fediverse/connections/7/profile/alice%40example.com';
const FOLLOWERS_URL =
	'/wpcom/v2/reader/fediverse/connections/7/profile/alice%40example.com/followers';

function makeClient() {
	return new QueryClient( {
		defaultOptions: {
			queries: { retry: false, staleTime: 0 },
			mutations: { retry: false },
		},
	} );
}

function mockConnections() {
	return nock( BASE )
		.get( CONNECTIONS_URL )
		.reply( 200, {
			connections: [
				{
					id: 7,
					blog_id: 700,
					url: 'https://example.com',
					name: 'Example Blog',
					icon: '',
					webfinger: '@example@example.com',
				},
			],
		} );
}

function mockProfile() {
	return nock( BASE )
		.get( PROFILE_URL )
		.reply( 200, {
			profile: {
				id: 'https://example.com/users/alice',
				username: 'alice',
				acct: '@alice@example.com',
				handle: '@alice@example.com',
				instance: 'example.com',
				display_name: 'Alice',
				note: '',
				avatar: null,
				header: null,
				url: 'https://example.com/@alice',
				locked: false,
				counts: { followers: 2, following: 5, posts: 42 },
				viewer: { following: false, followed_by: false, requested: false },
				is_self: false,
			},
		} );
}

describe( 'FollowersView', () => {
	// `SocialFeedList` uses IntersectionObserver via `react-intersection-observer`;
	// jsdom doesn't provide it.
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

	afterEach( () => nock.cleanAll() );

	it( 'renders an account row per follower with the actor handle visible', async () => {
		mockConnections();
		mockProfile();
		nock( BASE )
			.get( FOLLOWERS_URL )
			.query( true )
			.reply( 200, {
				items: [
					{
						id: 'https://example.com/users/bob',
						username: 'bob',
						acct: '@bob@example.com',
						handle: 'bob@example.com',
						display_name: 'Bob',
						note_text: 'A follower bio.',
						avatar: null,
						locked: false,
						viewer: { following: false, followed_by: false, requested: false },
						is_self: false,
					},
				],
				cursor: null,
			} );

		renderWithProvider( <FollowersView connectionId={ 7 } actor="alice@example.com" />, {
			queryClient: makeClient(),
		} );

		await waitFor( () => expect( screen.getByText( 'Bob' ) ).toBeVisible() );
		// `SocialAccountRow` prefixes its own `@` at render time; the bare wire
		// handle (`bob@example.com`) must reach the row unprefixed.
		expect( screen.getByText( '@bob@example.com' ) ).toBeVisible();
	} );

	it( 'shows an empty state when the actor has no followers', async () => {
		mockConnections();
		mockProfile();
		nock( BASE ).get( FOLLOWERS_URL ).query( true ).reply( 200, { items: [], cursor: null } );

		renderWithProvider( <FollowersView connectionId={ 7 } actor="alice@example.com" />, {
			queryClient: makeClient(),
		} );

		await waitFor( () => expect( screen.getByText( 'No followers yet' ) ).toBeVisible() );
	} );

	it( 'shows a generic connection-error empty state when the followers query 401s', async () => {
		mockConnections();
		mockProfile();
		// 401 → `auth_required`. Fediverse passes `authRequiredCopy` to
		// `SocialAccountList`, replacing the default reconnect copy with the
		// generic "Couldn't load followers" / "Something went wrong …" copy
		// plus a Retry button (the Reader doesn't have a working Fediverse
		// reconnect flow yet).
		nock( BASE ).get( FOLLOWERS_URL ).query( true ).reply( 401, { code: 'not_authenticated' } );

		renderWithProvider( <FollowersView connectionId={ 7 } actor="alice@example.com" />, {
			queryClient: makeClient(),
		} );

		await waitFor( () =>
			expect(
				screen.getByText( /Something went wrong with your Fediverse connection/i )
			).toBeVisible()
		);
		expect( screen.queryByRole( 'heading', { name: /reconnect needed/i } ) ).toBeNull();
		expect( screen.getByRole( 'button', { name: /retry/i } ) ).toBeVisible();
	} );

	it( 'hides the follow control on `is_self` rows', async () => {
		mockConnections();
		mockProfile();
		nock( BASE )
			.get( FOLLOWERS_URL )
			.query( true )
			.reply( 200, {
				items: [
					{
						id: 'https://example.com/users/me',
						username: 'me',
						acct: '@me@example.com',
						handle: 'me@example.com',
						display_name: 'Me',
						note_text: '',
						avatar: null,
						locked: false,
						viewer: { following: false, followed_by: false, requested: false },
						is_self: true,
					},
				],
				cursor: null,
			} );

		renderWithProvider( <FollowersView connectionId={ 7 } actor="alice@example.com" />, {
			queryClient: makeClient(),
		} );

		await waitFor( () => expect( screen.getByText( 'Me' ) ).toBeVisible() );
		// `is_self` rows skip the followState block; no follow / unfollow button
		// is rendered for the caller's own row.
		expect( screen.queryByRole( 'button', { name: /^follow/i } ) ).not.toBeInTheDocument();
		expect( screen.queryByRole( 'button', { name: /^unfollow/i } ) ).not.toBeInTheDocument();
	} );

	it( 'renders the row without a follow control when the wire `viewer` is missing', async () => {
		// `viewer` is optional during the backend rollout window; the row
		// should still render but with no follow button.
		mockConnections();
		mockProfile();
		nock( BASE )
			.get( FOLLOWERS_URL )
			.query( true )
			.reply( 200, {
				items: [
					{
						id: 'https://example.com/users/carol',
						username: 'carol',
						acct: '@carol@example.com',
						handle: 'carol@example.com',
						display_name: 'Carol',
						note_text: '',
						avatar: null,
						locked: false,
						// `viewer` intentionally omitted
						is_self: false,
					},
				],
				cursor: null,
			} );

		renderWithProvider( <FollowersView connectionId={ 7 } actor="alice@example.com" />, {
			queryClient: makeClient(),
		} );

		await waitFor( () => expect( screen.getByText( 'Carol' ) ).toBeVisible() );
		expect( screen.queryByRole( 'button', { name: /follow/i } ) ).not.toBeInTheDocument();
	} );

	it( 'fires the follow mutation when the Follow button is clicked', async () => {
		mockConnections();
		mockProfile();
		nock( BASE )
			.get( FOLLOWERS_URL )
			.query( true )
			.reply( 200, {
				items: [
					{
						id: 'https://example.com/users/bob',
						username: 'bob',
						acct: '@bob@example.com',
						handle: 'bob@example.com',
						display_name: 'Bob',
						note_text: '',
						avatar: null,
						locked: false,
						viewer: { following: false, followed_by: false, requested: false },
						is_self: false,
					},
				],
				cursor: null,
			} );

		// The mutation POSTs to /follows; nock returns the new viewer.
		const followCall = nock( BASE )
			.post( '/wpcom/v2/reader/fediverse/connections/7/follows', { actor: 'bob@example.com' } )
			.reply( 200, {
				viewer: { following: true, followed_by: false, requested: false },
			} );

		const user = userEvent.setup();
		renderWithProvider( <FollowersView connectionId={ 7 } actor="alice@example.com" />, {
			queryClient: makeClient(),
		} );

		const button = await screen.findByRole( 'button', { name: /^follow$/i } );
		await user.click( button );

		await waitFor( () => expect( followCall.isDone() ).toBe( true ) );
	} );
} );
