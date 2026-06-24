/**
 * @jest-environment jsdom
 */
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { NotificationsPanel } from '../notifications-panel';
import type { AtmosphereConnection } from '@automattic/api-core';

jest.mock( 'calypso/state/reader/analytics/actions', () => ( {
	recordReaderTracksEvent: () => ( { type: '@@TEST/NOOP' } ),
} ) );

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

	it( 'routes post-target rows to the in-app thread URL', async () => {
		nock( BASE )
			.get( '/wpcom/v2/reader/atmosphere/connections/101/notifications' )
			.query( {} )
			.reply( 200, {
				items: [
					{
						id: 'a',
						protocol_type: 'mention',
						canonical_type: 'mention',
						actor: {
							handle: 'jane.bsky.social',
							display_name: 'Jane',
							avatar_url: null,
							profile_uri: 'at://did:plc:jane',
						},
						target: {
							kind: 'post',
							uri: 'at://did:plc:abcdefghijklmnopqrstuvwx/app.bsky.feed.post/3abcdefghijkl',
							excerpt: '@me hi',
						},
						target_url: 'https://bsky.app/profile/jane.bsky.social/post/3abcdefghijkl',
						created_at: '2026-05-11T12:34:56Z',
						is_read: false,
					},
				],
				next_cursor: null,
				seen_at: null,
			} );
		renderWithProvider( <NotificationsPanel connection={ connection } /> );
		const link = await screen.findByRole( 'link', { name: /jane mentioned you/i } );
		expect( link ).toHaveAttribute(
			'href',
			'/reader/atmosphere/101/thread/did:plc:abcdefghijklmnopqrstuvwx/3abcdefghijkl'
		);
		expect( link ).not.toHaveAttribute( 'target' );
	} );

	it( 'switching to the Likes chip refetches with types=like', async () => {
		nock( BASE )
			.get( '/wpcom/v2/reader/atmosphere/connections/101/notifications' )
			.query( {} )
			.reply( 200, { items: [], next_cursor: null, seen_at: null } )
			.get( '/wpcom/v2/reader/atmosphere/connections/101/notifications' )
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
