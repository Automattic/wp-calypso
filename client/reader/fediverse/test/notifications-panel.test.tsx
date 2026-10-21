/**
 * @jest-environment jsdom
 */
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { NotificationsPanel } from '../notifications-panel';
import type { FediverseConnection } from '@automattic/api-core';

jest.mock( 'calypso/state/reader/analytics/actions', () => ( {
	recordReaderTracksEvent: () => ( { type: '@@TEST/NOOP' } ),
} ) );

const BASE = 'https://public-api.wordpress.com';

const connection: FediverseConnection = {
	id: 101,
	blog_id: 12345,
	url: 'https://myblog.wordpress.com',
	name: 'My Blog',
	icon: '',
	webfinger: '@myblog@myblog.wordpress.com',
};

describe( 'Fediverse NotificationsPanel', () => {
	afterEach( () => nock.cleanAll() );

	it( 'renders fetched notifications via the shared list', async () => {
		nock( BASE )
			.get( '/wpcom/v2/reader/fediverse/connections/101/notifications' )
			.query( {} )
			.reply( 200, {
				items: [
					{
						id: '13371337',
						// Raw AP activity kind; the canonical enum normalizes to
						// 'like' so the shared renderer can emit the same phrase
						// across protocols.
						protocol_type: 'Like',
						canonical_type: 'like',
						actor: {
							handle: 'jane@example.com',
							display_name: 'Jane',
							avatar_url: null,
							profile_uri: 'https://example.com/users/jane',
						},
						// `''` excerpt is the documented contract for likes
						// (subject post text isn't fetched).
						target: {
							kind: 'post',
							uri: 'https://example.com/users/me/statuses/110000000000000001',
							excerpt: '',
						},
						target_url: 'https://example.com/users/me/statuses/110000000000000001',
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

	it( 'renders AP "Announce" notifications as repost via canonical_type', async () => {
		nock( BASE )
			.get( '/wpcom/v2/reader/fediverse/connections/101/notifications' )
			.query( {} )
			.reply( 200, {
				items: [
					{
						id: '13371338',
						protocol_type: 'Announce',
						canonical_type: 'repost',
						actor: {
							handle: 'jane@example.com',
							display_name: 'Jane',
							avatar_url: null,
							profile_uri: 'https://example.com/users/jane',
						},
						target: {
							kind: 'post',
							uri: 'https://example.com/users/me/statuses/110000000000000002',
							excerpt: '',
						},
						target_url: 'https://example.com/users/me/statuses/110000000000000002',
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
		// and a generic phrase. Guards the long-tail rendering path so a
		// future AP activity (Move, Block, etc.) projected as 'other'
		// renders sensibly even before a bespoke template ships.
		nock( BASE )
			.get( '/wpcom/v2/reader/fediverse/connections/101/notifications' )
			.query( {} )
			.reply( 200, {
				items: [
					{
						id: '13371339',
						protocol_type: 'Move',
						canonical_type: 'other',
						actor: {
							handle: 'mover@example.com',
							display_name: 'Mover',
							avatar_url: null,
							profile_uri: 'https://example.com/users/mover',
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

	it( 'renders an empty state when no notifications', async () => {
		nock( BASE )
			.get( '/wpcom/v2/reader/fediverse/connections/101/notifications' )
			.query( {} )
			.reply( 200, { items: [], next_cursor: null, seen_at: null } );
		renderWithProvider( <NotificationsPanel connection={ connection } /> );
		await waitFor( () => expect( screen.getByText( /no notifications yet/i ) ).toBeVisible() );
	} );

	it( 'switching to the Likes chip refetches with types=like', async () => {
		nock( BASE )
			.get( '/wpcom/v2/reader/fediverse/connections/101/notifications' )
			.query( {} )
			.reply( 200, { items: [], next_cursor: null, seen_at: null } )
			.get( '/wpcom/v2/reader/fediverse/connections/101/notifications' )
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
