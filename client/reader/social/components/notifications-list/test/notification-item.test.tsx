/**
 * @jest-environment jsdom
 */
import page from '@automattic/calypso-router';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { SocialNotificationItem } from '../notification-item';
import type { AtmosphereNotification } from '@automattic/api-core';

jest.mock( '@automattic/calypso-router', () => jest.fn() );
const pageMock = jest.mocked( page );

function makeItem( overrides: Partial< AtmosphereNotification > = {} ): AtmosphereNotification {
	return {
		id: 'at://x',
		protocol_type: 'like',
		canonical_type: 'like',
		actor: {
			handle: 'jane.bsky.social',
			display_name: 'Jane',
			avatar_url: null,
			profile_uri: 'at://did:plc:jane',
		},
		target: { kind: 'post', uri: 'at://post', excerpt: 'hello world' },
		target_url: 'https://bsky.app/profile/me/post/3k',
		created_at: '2026-05-11T12:34:56Z',
		is_read: false,
		...overrides,
	};
}

describe( 'SocialNotificationItem', () => {
	beforeEach( () => {
		pageMock.mockReset();
	} );

	it( 'renders a like notification with actor + excerpt', () => {
		renderWithProvider( <SocialNotificationItem notification={ makeItem() } /> );
		expect( screen.getByText( /jane/i ) ).toBeVisible();
		expect( screen.getByText( /liked your post/i ) ).toBeVisible();
		expect( screen.getByText( /hello world/i ) ).toBeVisible();
	} );

	it( 'renders a follow notification with no target excerpt', () => {
		renderWithProvider(
			<SocialNotificationItem
				notification={ makeItem( {
					canonical_type: 'follow',
					protocol_type: 'follow',
					target: null,
				} ) }
			/>
		);
		expect( screen.getByText( /followed you/i ) ).toBeVisible();
		expect( screen.queryByText( /hello world/i ) ).toBeNull();
	} );

	it.each( [
		[ 'repost', /reposted your post/i ],
		[ 'mention', /mentioned you/i ],
		[ 'reply', /replied to your post/i ],
		[ 'quote', /quoted your post/i ],
	] as const )( 'renders a %s notification', ( type, copy ) => {
		renderWithProvider(
			<SocialNotificationItem
				notification={ makeItem( { canonical_type: type, protocol_type: type } ) }
			/>
		);
		expect( screen.getByText( copy ) ).toBeVisible();
	} );

	it( 'renders an unknown canonical_type with a generic translated phrase', () => {
		renderWithProvider(
			<SocialNotificationItem
				notification={ makeItem( {
					canonical_type: 'other',
					protocol_type: 'starterpack-joined',
					target: null,
				} ) }
			/>
		);
		expect( screen.getByText( /interacted with you/i ) ).toBeVisible();
		// The raw protocol_type must not leak through to the UI.
		expect( screen.queryByText( /starterpack/i ) ).toBeNull();
	} );

	it( 'announces a per-action aria label on the link', () => {
		renderWithProvider( <SocialNotificationItem notification={ makeItem() } /> );
		expect( screen.getByRole( 'link' ) ).toHaveAccessibleName( /jane liked your post/i );
	} );

	it( 'links the row to target_url with target=_blank', () => {
		renderWithProvider( <SocialNotificationItem notification={ makeItem() } /> );
		const link = screen.getByRole( 'link' );
		expect( link ).toHaveAttribute( 'href', 'https://bsky.app/profile/me/post/3k' );
		expect( link ).toHaveAttribute( 'target', '_blank' );
		expect( link.getAttribute( 'rel' ) ).toMatch( /noopener/ );
	} );

	it( 'applies an unread class when is_read is false', () => {
		const { container } = renderWithProvider(
			<SocialNotificationItem notification={ makeItem( { is_read: false } ) } />
		);
		expect( container.querySelector( '.is-unread' ) ).not.toBeNull();
	} );

	it( 'does not apply unread class when is_read is true', () => {
		const { container } = renderWithProvider(
			<SocialNotificationItem notification={ makeItem( { is_read: true } ) } />
		);
		expect( container.querySelector( '.is-unread' ) ).toBeNull();
	} );

	it( 'renders as a non-navigating div when target_url is not http(s)', () => {
		const { container } = renderWithProvider(
			<SocialNotificationItem notification={ makeItem( { target_url: 'javascript:alert(1)' } ) } />
		);
		// Should NOT be a link.
		expect( screen.queryByRole( 'link' ) ).toBeNull();
		// Root is the .social-notification-item element, rendered as a <div>.
		const root = container.querySelector( '.social-notification-item' );
		expect( root?.tagName ).toBe( 'DIV' );
	} );

	it( 'folds the unread state into the link aria-label so screen readers hear it', () => {
		renderWithProvider(
			<SocialNotificationItem notification={ makeItem( { is_read: false } ) } />
		);
		expect( screen.getByRole( 'link' ) ).toHaveAccessibleName( /^unread\. jane liked your post/i );
	} );

	it( 'omits the unread prefix from the aria-label when is_read is true', () => {
		renderWithProvider( <SocialNotificationItem notification={ makeItem( { is_read: true } ) } /> );
		expect( screen.getByRole( 'link' ) ).toHaveAccessibleName( /^jane liked your post/i );
	} );

	it( 'links to the in-app URL with SPA navigation when getInAppUrl returns a path', async () => {
		const user = userEvent.setup();
		renderWithProvider(
			<SocialNotificationItem
				notification={ makeItem( { canonical_type: 'mention', protocol_type: 'mention' } ) }
				getInAppUrl={ () => '/reader/atmosphere/42/thread/did:plc:abc/post1' }
			/>
		);
		const link = screen.getByRole( 'link' );
		expect( link ).toHaveAttribute( 'href', '/reader/atmosphere/42/thread/did:plc:abc/post1' );
		expect( link ).not.toHaveAttribute( 'target' );
		await user.click( link );
		expect( pageMock ).toHaveBeenCalledWith( '/reader/atmosphere/42/thread/did:plc:abc/post1' );
	} );

	it( 'falls back to the external target_url when getInAppUrl returns null', () => {
		renderWithProvider(
			<SocialNotificationItem notification={ makeItem() } getInAppUrl={ () => null } />
		);
		const link = screen.getByRole( 'link' );
		expect( link ).toHaveAttribute( 'href', 'https://bsky.app/profile/me/post/3k' );
		expect( link ).toHaveAttribute( 'target', '_blank' );
	} );

	it( 'defers to the browser on modifier-click so users can open in a new tab', async () => {
		const user = userEvent.setup();
		renderWithProvider(
			<SocialNotificationItem
				notification={ makeItem() }
				getInAppUrl={ () => '/reader/atmosphere/42/thread/did:plc:abc/post1' }
			/>
		);
		await user.keyboard( '[ControlLeft>]' );
		await user.click( screen.getByRole( 'link' ) );
		await user.keyboard( '[/ControlLeft]' );
		expect( pageMock ).not.toHaveBeenCalled();
	} );

	it( 'falls back to the actor handle when display_name is null', () => {
		renderWithProvider(
			<SocialNotificationItem
				notification={ makeItem( {
					actor: {
						handle: 'jane.bsky.social',
						display_name: null,
						avatar_url: null,
						profile_uri: 'at://did:plc:jane',
					},
				} ) }
			/>
		);
		expect( screen.getByText( /jane\.bsky\.social/ ) ).toBeVisible();
		expect( screen.getByRole( 'link' ) ).toHaveAccessibleName(
			/jane\.bsky\.social liked your post/i
		);
	} );
} );
