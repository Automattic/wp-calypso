/**
 * @jest-environment jsdom
 */
import { QueryClient } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { ComposerModal, ComposerProvider } from 'calypso/reader/social/composer';
import * as readerAnalytics from 'calypso/state/reader/analytics/actions';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { mastodonComposerConfig } from '../composer-config';
import { ProfilePanel } from '../profile-panel';
import type { MastodonAuthorProfile, MastodonConnection } from '@automattic/api-core';

jest.mock( '@automattic/calypso-router', () => jest.fn() );

// MastodonAuthorProfileTabs (rendered inside MastodonAuthorProfilePanel)
// uses IntersectionObserver, which jsdom doesn't provide.
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
	id: 101,
	handle: '@alice@mastodon.social',
	instance: 'mastodon.social',
	display_name: 'Alice',
	avatar: null,
};

// `connection.handle` is `@alice@mastodon.social`; the query options
// normalize that to `alice@mastodon.social` (strip leading @, lowercase),
// then the fetcher URL-encodes it.
const ENCODED_ACTOR = 'alice%40mastodon.social';

function makeProfile( overrides: Partial< MastodonAuthorProfile > = {} ): MastodonAuthorProfile {
	return {
		id: '101',
		acct: 'alice@mastodon.social',
		display_name: 'Alice',
		avatar: null,
		header: null,
		note: 'hello there',
		counts: { followers: 10, following: 5, posts: 42 },
		locked: false,
		raw: {},
		...overrides,
	};
}

function makeClient() {
	return new QueryClient( {
		defaultOptions: { queries: { retry: false, staleTime: 0 } },
	} );
}

function mockAuthorEndpoints( profile: MastodonAuthorProfile = makeProfile() ) {
	nock( BASE )
		.get( `/wpcom/v2/reader/mastodon/connections/101/profile/${ ENCODED_ACTOR }` )
		.reply( 200, profile );
	nock( BASE )
		.get( `/wpcom/v2/reader/mastodon/connections/101/profile/${ ENCODED_ACTOR }/feed` )
		.query( true )
		.reply( 200, { items: [], cursor: null } );
}

function mockConnectionDetails( avatar: string | null = null ) {
	nock( BASE )
		.get( '/wpcom/v2/reader/mastodon/connections/101' )
		.reply( 200, {
			handle: '@alice@mastodon.social',
			instance: 'mastodon.social',
			display_name: 'Alice',
			description: '',
			avatar,
			header: null,
			counts: { followers: 10, following: 5, posts: 42 },
			raw: {},
		} );
}

describe( 'ProfilePanel', () => {
	beforeEach( () => {
		// recordReaderTracksEvent is a thunk that reads the follows query cache;
		// the test store doesn't seed that slice. Replace with a no-op so
		// dispatch() doesn't throw, while spies still observe arguments.
		jest
			.spyOn( readerAnalytics, 'recordReaderTracksEvent' )
			.mockImplementation( () => ( { type: '@@TEST/NOOP' } ) as never );
	} );

	afterEach( () => {
		nock.cleanAll();
		jest.restoreAllMocks();
		window.history.replaceState( {}, '', '/' );
	} );

	it( 'renders the connected user’s profile (bio, stats) and the author-feed surface', async () => {
		mockAuthorEndpoints();
		mockConnectionDetails();

		renderWithProvider( <ProfilePanel connection={ connection } />, {
			queryClient: makeClient(),
		} );

		await waitFor( () => expect( screen.getByText( 'hello there' ) ).toBeVisible() );
		const stats = screen.getByRole( 'list', { name: /profile stats/i } );
		expect( stats ).toHaveTextContent( '42 posts' );
		expect( stats ).toHaveTextContent( '10 followers' );
	} );

	it( 'renders the compose pill with the avatar from the details query when wrapped in a ComposerProvider', async () => {
		mockAuthorEndpoints();
		mockConnectionDetails( 'https://example.test/alice-avatar.png' );

		renderWithProvider(
			<ComposerProvider connectionId={ 101 } config={ mastodonComposerConfig }>
				<ProfilePanel connection={ connection } />
			</ComposerProvider>,
			{ queryClient: makeClient() }
		);

		// The pill renders only after the details query resolves — the
		// avatar isn't available on `connection` (list endpoint returns
		// `null`) so the pill waits for `useMastodonConnectionQuery`.
		const pill = await screen.findByRole( 'button', { name: /what['’]s up/i } );
		const avatar = pill.querySelector< HTMLImageElement >( 'img.social-compose-pill__avatar' );
		expect( avatar?.getAttribute( 'src' ) ).toBe( 'https://example.test/alice-avatar.png' );
	} );

	it( 'fires _compose_opened with entry_point=profile_inline when the pill is clicked', async () => {
		mockAuthorEndpoints();
		mockConnectionDetails( 'https://example.test/alice-avatar.png' );

		renderWithProvider(
			<ComposerProvider connectionId={ 101 } config={ mastodonComposerConfig }>
				<ProfilePanel connection={ connection } />
				<ComposerModal />
			</ComposerProvider>,
			{ queryClient: makeClient() }
		);

		const user = userEvent.setup();
		const pill = await screen.findByRole( 'button', { name: /what['’]s up/i } );
		await user.click( pill );

		// The pill calls `openComposer({ kind: 'standalone', entry_point:
		// 'profile_inline' })`; the modal then dispatches the
		// `_compose_opened` Tracks event in its mount effect.
		await waitFor( () =>
			expect( readerAnalytics.recordReaderTracksEvent ).toHaveBeenCalledWith(
				'calypso_reader_mastodon_compose_opened',
				expect.objectContaining( { connection_id: 101, entry_point: 'profile_inline' } )
			)
		);
	} );

	it( 'does not render the compose pill when no ComposerProvider is mounted', async () => {
		mockAuthorEndpoints();
		mockConnectionDetails( 'https://example.test/alice-avatar.png' );

		renderWithProvider( <ProfilePanel connection={ connection } />, {
			queryClient: makeClient(),
		} );

		await waitFor( () => expect( screen.getByText( 'hello there' ) ).toBeVisible() );
		expect( screen.queryByRole( 'button', { name: /what['’]s up/i } ) ).toBeNull();
	} );

	it( 'fires _profile_viewed once per (actor, connection) after profile.data resolves', async () => {
		// `SocialAuthorProfilePanel` (rendered inside MastodonAuthorProfilePanel)
		// dispatches `${prefix}profile_viewed` once when the profile query
		// resolves. With the Mastodon prefix that's
		// `calypso_reader_mastodon_profile_viewed` — this asserts the
		// connected-user /profile surface fires it with the expected payload
		// (connection_id, actor, actor_handle, actor_id, initial_filter), so
		// dashboards can split "own profile vs. someone else's" via the actor
		// field.
		mockAuthorEndpoints();
		mockConnectionDetails();

		renderWithProvider( <ProfilePanel connection={ connection } />, {
			queryClient: makeClient(),
		} );

		await waitFor( () =>
			expect( readerAnalytics.recordReaderTracksEvent ).toHaveBeenCalledWith(
				'calypso_reader_mastodon_profile_viewed',
				expect.objectContaining( {
					connection_id: 101,
					actor: '@alice@mastodon.social',
					actor_handle: 'alice@mastodon.social',
					actor_id: '101',
					initial_filter: 'posts_no_replies',
				} )
			)
		);
	} );
} );
