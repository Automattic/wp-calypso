/**
 * @jest-environment jsdom
 */
import { screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { NotificationsPanel } from '../notifications-panel';
import type { AtmosphereConnection } from '@automattic/api-core';

const BASE = 'https://public-api.wordpress.com';

const connection: AtmosphereConnection = {
	id: 101,
	did: 'did:plc:me',
	handle: 'me.bsky.social',
	display_name: 'Me',
	avatar: null,
};

describe( 'NotificationsPanel', () => {
	afterEach( () => nock.cleanAll() );

	it( 'renders fetched notifications via the shared list', async () => {
		nock( BASE )
			.get( '/wpcom/v2/reader/atmosphere/connections/101/notifications' )
			.query( {} )
			.reply( 200, {
				items: [
					{
						id: 'a',
						protocol_type: 'like',
						canonical_type: 'like',
						actor: {
							handle: 'jane.bsky.social',
							display_name: 'Jane',
							avatar_url: null,
							profile_uri: 'at://did:plc:jane',
						},
						target: { kind: 'post', uri: 'at://post', excerpt: 'hi' },
						target_url: 'https://bsky.app/profile/me/post/3k',
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

	it( 'renders an empty state when no notifications', async () => {
		nock( BASE )
			.get( '/wpcom/v2/reader/atmosphere/connections/101/notifications' )
			.query( {} )
			.reply( 200, { items: [], next_cursor: null, seen_at: null } );
		renderWithProvider( <NotificationsPanel connection={ connection } /> );
		await waitFor( () => expect( screen.getByText( /no notifications yet/i ) ).toBeVisible() );
	} );
} );
