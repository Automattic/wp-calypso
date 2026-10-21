/**
 * @jest-environment jsdom
 */
import { QueryClient } from '@tanstack/react-query';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { ComposerModal, ComposerProvider, useComposer } from 'calypso/reader/social/composer';
import * as analytics from 'calypso/state/reader/analytics/actions';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { atmosphereComposerConfig } from '../composer-config';
import { ProfilePanel } from '../profile-panel';
import type { AtmosphereConnection } from '@automattic/api-core';
import type { ActiveMode } from 'calypso/reader/social/composer';

const connection: AtmosphereConnection = {
	id: 42,
	did: 'did:plc:viewer',
	handle: 'viewer.bsky.social',
	display_name: 'Viewer',
	avatar: null,
};

const profilePayload = {
	did: 'did:plc:viewer',
	handle: 'viewer.bsky.social',
	display_name: 'Viewer Name',
	description: 'About me.',
	description_html: '<p>About me.</p>',
	avatar: 'https://cdn.example/a.jpg',
	banner: 'https://cdn.example/b.jpg',
	bluesky_url: 'https://bsky.app/profile/viewer.bsky.social',
	counts: { followers: 12, follows: 7, posts: 4 },
	viewer: { following: null, following_rkey: null, followed_by: false },
};

const feedItem = {
	uri: 'at://did:plc:viewer/app.bsky.feed.post/aaaaaaaaaaaaa',
	cid: 'cid',
	author: {
		did: 'did:plc:viewer',
		handle: 'viewer.bsky.social',
		display_name: 'Viewer Name',
		avatar: null,
	},
	created_at: '2024-01-01T00:00:00.000Z',
	indexed_at: '2024-01-01T00:00:00.000Z',
	text: 'hello world',
	html: '<p>hello world</p>',
	lang: [ 'en' ],
	reply_parent: null,
	reply_root: null,
	reason: null,
	embed: null,
	counts: { replies: 0, reposts: 0, likes: 0, quotes: 0 },
	bluesky_url: 'https://bsky.app/profile/viewer.bsky.social/post/aaaaaaaaaaaaa',
};

function makeQueryClient() {
	return new QueryClient( { defaultOptions: { queries: { retry: false, retryDelay: 0 } } } );
}

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

beforeEach( () => {
	// recordReaderTracksEvent is a thunk that reads the follows query cache.
	// Stub it so the modal's _compose_opened effect doesn't hit the
	// missing slice of the test store.
	jest
		.spyOn( analytics, 'recordReaderTracksEvent' )
		.mockImplementation( () => ( { type: '@@TEST/NOOP' } ) as never );
	window.history.replaceState( {}, '', '/reader/atmosphere/42/profile' );
} );

afterEach( () => {
	nock.cleanAll();
	jest.restoreAllMocks();
} );

describe( 'ProfilePanel (own profile)', () => {
	function setupHappyPath() {
		nock( 'https://public-api.wordpress.com' )
			.get( '/wpcom/v2/reader/atmosphere/connections/42/profile/viewer.bsky.social' )
			.reply( 200, profilePayload );
		nock( 'https://public-api.wordpress.com' )
			.get( '/wpcom/v2/reader/atmosphere/connections/42/profile/viewer.bsky.social/feed' )
			.query( true )
			.reply( 200, { items: [ feedItem ], cursor: null } );
	}

	it( "renders the profile card and the user's post once both queries resolve", async () => {
		setupHappyPath();

		renderWithProvider( <ProfilePanel connection={ connection } />, {
			queryClient: makeQueryClient(),
		} );

		expect( await screen.findByRole( 'heading', { level: 2, name: 'Viewer Name' } ) ).toBeVisible();
		expect( await screen.findByText( 'hello world' ) ).toBeVisible();
	} );

	it( 'subtab links use the no-actor profile base path', async () => {
		setupHappyPath();

		renderWithProvider( <ProfilePanel connection={ connection } />, {
			queryClient: makeQueryClient(),
		} );

		await screen.findByRole( 'heading', { level: 2, name: 'Viewer Name' } );

		expect( screen.getByRole( 'menuitem', { name: 'Posts' } ) ).toHaveAttribute(
			'href',
			'/reader/atmosphere/42/profile?tab=posts'
		);
		expect( screen.getByRole( 'menuitem', { name: 'Replies' } ) ).toHaveAttribute(
			'href',
			'/reader/atmosphere/42/profile?tab=replies'
		);
		expect( screen.getByRole( 'menuitem', { name: 'Media' } ) ).toHaveAttribute(
			'href',
			'/reader/atmosphere/42/profile?tab=media'
		);
	} );

	it( "does not render the Follow button on the connection owner's own profile", async () => {
		setupHappyPath();

		renderWithProvider( <ProfilePanel connection={ connection } />, {
			queryClient: makeQueryClient(),
		} );

		await screen.findByRole( 'heading', { level: 2, name: 'Viewer Name' } );
		expect( screen.queryByRole( 'button', { name: /^Follow$/i } ) ).toBeNull();
		expect( screen.queryByRole( 'button', { name: /^Following$/i } ) ).toBeNull();
	} );

	it( 'does not render the back-to-timeline button on the own-profile route', async () => {
		setupHappyPath();

		renderWithProvider( <ProfilePanel connection={ connection } />, {
			queryClient: makeQueryClient(),
		} );

		await screen.findByRole( 'heading', { level: 2, name: 'Viewer Name' } );
		expect( screen.queryByRole( 'button', { name: /back/i } ) ).toBeNull();
	} );

	it( 'preserves unrelated query params when building subtab hrefs', async () => {
		setupHappyPath();
		window.history.replaceState( {}, '', '/reader/atmosphere/42/profile?from=tabs&foo=bar' );

		renderWithProvider( <ProfilePanel connection={ connection } />, {
			queryClient: makeQueryClient(),
		} );

		await screen.findByRole( 'heading', { level: 2, name: 'Viewer Name' } );
		expect( screen.getByRole( 'menuitem', { name: 'Replies' } ) ).toHaveAttribute(
			'href',
			'/reader/atmosphere/42/profile?from=tabs&foo=bar&tab=replies'
		);
	} );

	it( 'renders an error state when the profile endpoint fails', async () => {
		// atmosphereScopedProfileQuery retries non-terminal errors; persist the
		// 502 reply so retry-policy tweaks don't make this test pass for the
		// wrong reason.
		nock( 'https://public-api.wordpress.com' )
			.persist()
			.get( '/wpcom/v2/reader/atmosphere/connections/42/profile/viewer.bsky.social' )
			.reply( 502, { error: 'atmosphere_upstream_unavailable' } );
		nock( 'https://public-api.wordpress.com' )
			.get( '/wpcom/v2/reader/atmosphere/connections/42/profile/viewer.bsky.social/feed' )
			.query( true )
			.reply( 200, { items: [], cursor: null } );

		renderWithProvider( <ProfilePanel connection={ connection } />, {
			queryClient: makeQueryClient(),
		} );

		expect( await screen.findByText( /Bluesky is unreachable right now\./i ) ).toBeVisible();
	} );
} );

describe( 'ProfilePanel — compose pill', () => {
	// Match either a curly or straight apostrophe — the production placeholder
	// uses the curly form (CLAUDE.md preserves it).
	const PLACEHOLDER_RE = /what['’]s up/i;

	function Spy( { onMode }: { onMode: ( m: ActiveMode ) => void } ) {
		const { mode } = useComposer();
		if ( mode ) {
			onMode( mode );
		}
		return null;
	}

	it( 'renders the compose pill above the profile card and opens the standalone modal with entry_point=profile_inline', async () => {
		nock( 'https://public-api.wordpress.com' )
			.get( '/wpcom/v2/reader/atmosphere/connections/42' )
			.reply( 200, {
				did: 'did:plc:viewer',
				handle: 'viewer.bsky.social',
				display_name: 'Viewer Name',
				description: 'About me.',
				avatar: 'https://cdn.example/a.jpg',
				banner: 'https://cdn.example/b.jpg',
				counts: { followers: 12, follows: 7, posts: 4 },
			} );
		nock( 'https://public-api.wordpress.com' )
			.get( '/wpcom/v2/reader/atmosphere/connections/42/profile/viewer.bsky.social' )
			.reply( 200, profilePayload );
		nock( 'https://public-api.wordpress.com' )
			.get( '/wpcom/v2/reader/atmosphere/connections/42/profile/viewer.bsky.social/feed' )
			.query( true )
			.reply( 200, { items: [], cursor: null } );

		const onMode = jest.fn();
		const user = userEvent.setup();

		renderWithProvider(
			<ComposerProvider connectionId={ 42 } config={ atmosphereComposerConfig }>
				<ProfilePanel connection={ connection } />
				<Spy onMode={ onMode } />
				<ComposerModal />
			</ComposerProvider>,
			{ queryClient: makeQueryClient() }
		);

		const pill = await screen.findByRole( 'button', { name: PLACEHOLDER_RE } );
		expect( pill ).toBeVisible();

		await user.click( pill );

		expect( await screen.findByRole( 'dialog', { name: 'New post' } ) ).toBeVisible();
		expect( onMode ).toHaveBeenCalledWith(
			expect.objectContaining( { kind: 'standalone', entry_point: 'profile_inline' } )
		);
	} );

	it( 'renders the pill avatar from the connection-details query, not the list-endpoint shape', async () => {
		// The list endpoint that supplies `connection` always returns
		// `avatar: null`. The pill must source the avatar URL from the
		// connection-details query passed in by the panel.
		const detailsAvatar = 'https://cdn.example/details-avatar.jpg';
		nock( 'https://public-api.wordpress.com' )
			.get( '/wpcom/v2/reader/atmosphere/connections/42' )
			.reply( 200, {
				did: 'did:plc:viewer',
				handle: 'viewer.bsky.social',
				display_name: 'Viewer Name',
				description: 'About me.',
				avatar: detailsAvatar,
				banner: null,
				counts: { followers: 0, follows: 0, posts: 0 },
			} );
		nock( 'https://public-api.wordpress.com' )
			.get( '/wpcom/v2/reader/atmosphere/connections/42/profile/viewer.bsky.social' )
			.reply( 200, profilePayload );
		nock( 'https://public-api.wordpress.com' )
			.get( '/wpcom/v2/reader/atmosphere/connections/42/profile/viewer.bsky.social/feed' )
			.query( true )
			.reply( 200, { items: [], cursor: null } );

		const { container } = renderWithProvider(
			<ComposerProvider connectionId={ 42 } config={ atmosphereComposerConfig }>
				<ProfilePanel connection={ connection } />
			</ComposerProvider>,
			{ queryClient: makeQueryClient() }
		);

		// Wait for the pill to render after the connection details resolve.
		await screen.findByRole( 'button', { name: PLACEHOLDER_RE } );

		const avatarImg = container.querySelector< HTMLImageElement >( '.social-compose-pill__avatar' );
		expect( avatarImg?.tagName ).toBe( 'IMG' );
		expect( avatarImg?.getAttribute( 'src' ) ).toBe( detailsAvatar );
	} );
} );
