/**
 * @jest-environment jsdom
 */
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { NotificationsPanel } from '../notifications-panel';
import type { MastodonConnection } from '@automattic/api-core';

jest.mock( 'calypso/state/reader/analytics/actions', () => ( {
	recordReaderTracksEvent: () => ( { type: '@@TEST/NOOP' } ),
} ) );

const BASE = 'https://public-api.wordpress.com';

const connection: MastodonConnection = {
	id: 101,
	handle: '@me@mastodon.social',
	instance: 'mastodon.social',
	display_name: 'Me',
	avatar: null,
};

describe( 'Mastodon NotificationsPanel', () => {
	afterEach( () => nock.cleanAll() );

	it( 'renders fetched notifications via the shared list', async () => {
		nock( BASE )
			.get( '/wpcom/v2/reader/mastodon/connections/101/notifications' )
			.query( {} )
			.reply( 200, {
				items: [
					{
						id: '13371337',
						// Upstream Mastodon spells it "favourite"; the canonical
						// enum normalizes to "like" so the shared renderer can
						// emit the same phrase across protocols.
						protocol_type: 'favourite',
						canonical_type: 'like',
						actor: {
							handle: 'jane@mastodon.social',
							display_name: 'Jane',
							avatar_url: null,
							profile_uri: 'https://mastodon.social/@jane',
						},
						// `''` excerpt is the documented contract for likes
						// (subject post text isn't fetched).
						target: {
							kind: 'post',
							uri: 'https://mastodon.social/@me/110000000000000001',
							excerpt: '',
						},
						target_url: 'https://mastodon.social/@me/110000000000000001',
						created_at: '2026-05-11T12:34:56Z',
						is_read: false,
					},
				],
				next_cursor: null,
				seen_at: null,
			} );
		renderWithProvider( <NotificationsPanel connection={ connection } /> );
		await waitFor( () => expect( screen.getByText( /jane/i ) ).toBeVisible() );
		expect( screen.getByText( /liked your post/i ) ).toBeVisible();
	} );

	it( 'renders Mastodon "reblog" notifications as repost via canonical_type', async () => {
		nock( BASE )
			.get( '/wpcom/v2/reader/mastodon/connections/101/notifications' )
			.query( {} )
			.reply( 200, {
				items: [
					{
						id: '13371338',
						protocol_type: 'reblog',
						canonical_type: 'repost',
						actor: {
							handle: 'jane@mastodon.social',
							display_name: 'Jane',
							avatar_url: null,
							profile_uri: 'https://mastodon.social/@jane',
						},
						target: {
							kind: 'post',
							uri: 'https://mastodon.social/@me/110000000000000002',
							excerpt: '',
						},
						target_url: 'https://mastodon.social/@me/110000000000000002',
						created_at: '2026-05-11T13:00:00Z',
						is_read: false,
					},
				],
				next_cursor: null,
				seen_at: null,
			} );
		renderWithProvider( <NotificationsPanel connection={ connection } /> );
		await waitFor( () => expect( screen.getByText( /reposted your post/i ) ).toBeVisible() );
	} );

	it( 'falls back to the generic phrase for unknown canonical types (forward-compat)', async () => {
		// The wpcom envelope deliberately omits a `raw` passthrough; the
		// frontend renders unknown upstream kinds via canonical_type='other'
		// and a generic phrase. This guards the long-tail rendering path the
		// CM-660 / CM-662 envelope-shape tie-break depends on.
		nock( BASE )
			.get( '/wpcom/v2/reader/mastodon/connections/101/notifications' )
			.query( {} )
			.reply( 200, {
				items: [
					{
						id: '13371339',
						protocol_type: 'admin.sign_up',
						canonical_type: 'other',
						actor: {
							handle: 'newbie@mastodon.social',
							display_name: 'Newbie',
							avatar_url: null,
							profile_uri: 'https://mastodon.social/@newbie',
						},
						target: null,
						target_url: '',
						created_at: '2026-05-11T14:00:00Z',
						is_read: false,
					},
				],
				next_cursor: null,
				seen_at: null,
			} );
		renderWithProvider( <NotificationsPanel connection={ connection } /> );
		await waitFor( () => expect( screen.getByText( /interacted with you/i ) ).toBeVisible() );
	} );

	it( 'routes post-target rows to the in-app thread URL using the wire status_id', async () => {
		nock( BASE )
			.get( '/wpcom/v2/reader/mastodon/connections/101/notifications' )
			.query( {} )
			.reply( 200, {
				items: [
					{
						id: '13371340',
						protocol_type: 'mention',
						canonical_type: 'mention',
						actor: {
							handle: 'jane@mastodon.social',
							display_name: 'Jane',
							avatar_url: null,
							profile_uri: 'https://mastodon.social/@jane',
						},
						// Wire format per the wpcom NotificationsNormalizer:
						// `mastodon:<instance>:<status_id>`. The status id is the
						// home-instance local id, exactly what the in-app thread
						// route expects.
						target: {
							kind: 'post',
							uri: 'mastodon:mastodon.social:200',
							excerpt: '@me hi',
						},
						target_url: 'https://mastodon.social/@jane/200',
						created_at: '2026-05-11T15:00:00Z',
						is_read: false,
					},
				],
				next_cursor: null,
				seen_at: null,
			} );
		renderWithProvider( <NotificationsPanel connection={ connection } /> );
		const link = await screen.findByRole( 'link', { name: /jane mentioned you/i } );
		expect( link ).toHaveAttribute( 'href', '/reader/mastodon/101/thread/200' );
		expect( link ).not.toHaveAttribute( 'target' );
	} );

	it( 'falls back to target_url when the wire target.uri does not match the expected shape', async () => {
		nock( BASE )
			.get( '/wpcom/v2/reader/mastodon/connections/101/notifications' )
			.query( {} )
			.reply( 200, {
				items: [
					{
						id: '13371341',
						protocol_type: 'mention',
						canonical_type: 'mention',
						actor: {
							handle: 'jane@mastodon.social',
							display_name: 'Jane',
							avatar_url: null,
							profile_uri: 'https://mastodon.social/@jane',
						},
						// Malformed: status id is non-numeric. The resolver returns
						// null and the row should render the external target_url.
						target: {
							kind: 'post',
							uri: 'mastodon:mastodon.social:abc',
							excerpt: '@me hi',
						},
						target_url: 'https://mastodon.social/@jane/abc',
						created_at: '2026-05-11T15:30:00Z',
						is_read: false,
					},
				],
				next_cursor: null,
				seen_at: null,
			} );
		renderWithProvider( <NotificationsPanel connection={ connection } /> );
		const link = await screen.findByRole( 'link', { name: /jane mentioned you/i } );
		expect( link ).toHaveAttribute( 'href', 'https://mastodon.social/@jane/abc' );
		expect( link ).toHaveAttribute( 'target', '_blank' );
	} );

	it( 'renders an empty state when no notifications', async () => {
		nock( BASE )
			.get( '/wpcom/v2/reader/mastodon/connections/101/notifications' )
			.query( {} )
			.reply( 200, { items: [], next_cursor: null, seen_at: null } );
		renderWithProvider( <NotificationsPanel connection={ connection } /> );
		await waitFor( () => expect( screen.getByText( /no notifications yet/i ) ).toBeVisible() );
	} );

	it( 'switching to the Likes chip refetches with types=like', async () => {
		nock( BASE )
			.get( '/wpcom/v2/reader/mastodon/connections/101/notifications' )
			.query( {} )
			.reply( 200, { items: [], next_cursor: null, seen_at: null } )
			.get( '/wpcom/v2/reader/mastodon/connections/101/notifications' )
			.query( { types: 'like' } )
			.reply( 200, { items: [], next_cursor: null, seen_at: null } );

		const user = userEvent.setup();
		renderWithProvider( <NotificationsPanel connection={ connection } /> );
		await waitFor( () => expect( screen.getByText( /no notifications yet/i ) ).toBeVisible() );

		await user.click( screen.getByRole( 'radio', { name: /^likes$/i } ) );
		await waitFor( () => expect( screen.getByText( /no likes yet/i ) ).toBeVisible() );
		expect( nock.isDone() ).toBe( true );
	} );
} );
