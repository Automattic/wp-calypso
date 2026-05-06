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
import type { MastodonConnection } from '@automattic/api-core';

const BASE = 'https://public-api.wordpress.com';

function makeClient() {
	return new QueryClient( {
		defaultOptions: { queries: { retry: false, staleTime: 0 } },
	} );
}

const connection: MastodonConnection = {
	id: 101,
	handle: '@alice@mastodon.social',
	instance: 'mastodon.social',
	display_name: 'Alice',
	avatar: null,
};

describe( 'ProfilePanel', () => {
	afterEach( () => nock.cleanAll() );

	it( 'renders the verified profile for the passed connection', async () => {
		nock( BASE )
			.get( '/wpcom/v2/reader/mastodon/connections/101' )
			.reply( 200, {
				handle: '@alice@mastodon.social',
				instance: 'mastodon.social',
				display_name: 'Alice',
				description: 'hello there',
				avatar: null,
				header: null,
				counts: { followers: 10, following: 5, posts: 42 },
				raw: {},
			} );

		renderWithProvider( <ProfilePanel connection={ connection } />, {
			queryClient: makeClient(),
		} );

		await waitFor( () => expect( screen.getByText( 'hello there' ) ).toBeVisible() );
		const stats = screen.getByRole( 'list', { name: /profile stats/i } );
		expect( stats ).toHaveTextContent( '42 posts' );
		expect( stats ).toHaveTextContent( '10 followers' );
	} );

	it( 'renders the compose pill with the avatar from the details query when wrapped in a ComposerProvider', async () => {
		nock( BASE )
			.get( '/wpcom/v2/reader/mastodon/connections/101' )
			.reply( 200, {
				handle: '@alice@mastodon.social',
				instance: 'mastodon.social',
				display_name: 'Alice',
				description: 'hello there',
				avatar: 'https://example.test/alice-avatar.png',
				header: null,
				counts: { followers: 10, following: 5, posts: 42 },
				raw: {},
			} );

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
		nock( BASE )
			.get( '/wpcom/v2/reader/mastodon/connections/101' )
			.reply( 200, {
				handle: '@alice@mastodon.social',
				instance: 'mastodon.social',
				display_name: 'Alice',
				description: '',
				avatar: 'https://example.test/alice-avatar.png',
				header: null,
				counts: { followers: 0, following: 0, posts: 0 },
				raw: {},
			} );

		// `recordReaderTracksEvent` is a thunk that reads
		// state.reader.follows; the test store doesn't seed that slice.
		// Replace with a no-op action so dispatch() doesn't throw, while
		// the spy still observes call-site arguments.
		const trackSpy = jest
			.spyOn( readerAnalytics, 'recordReaderTracksEvent' )
			.mockImplementation( () => ( { type: '@@TEST/NOOP' } ) as never );

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
			expect( trackSpy ).toHaveBeenCalledWith(
				'calypso_reader_mastodon_compose_opened',
				expect.objectContaining( { connection_id: 101, entry_point: 'profile_inline' } )
			)
		);

		trackSpy.mockRestore();
	} );

	it( 'does not render the compose pill when no ComposerProvider is mounted', async () => {
		nock( BASE )
			.get( '/wpcom/v2/reader/mastodon/connections/101' )
			.reply( 200, {
				handle: '@alice@mastodon.social',
				instance: 'mastodon.social',
				display_name: 'Alice',
				description: 'hello there',
				avatar: 'https://example.test/alice-avatar.png',
				header: null,
				counts: { followers: 10, following: 5, posts: 42 },
				raw: {},
			} );

		renderWithProvider( <ProfilePanel connection={ connection } />, {
			queryClient: makeClient(),
		} );

		await waitFor( () => expect( screen.getByText( 'hello there' ) ).toBeVisible() );
		expect( screen.queryByRole( 'button', { name: /what['’]s up/i } ) ).toBeNull();
	} );
} );
