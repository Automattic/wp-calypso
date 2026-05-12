/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { SocialNotificationsList } from '../index';
import type { AtmosphereNotification } from '@automattic/api-core';

const baseItem: AtmosphereNotification = {
	id: 'a',
	protocol_type: 'like',
	canonical_type: 'like',
	actor: {
		handle: 'jane.bsky.social',
		display_name: 'Jane',
		avatar_url: null,
		profile_uri: 'at://did:plc:jane',
	},
	target: { kind: 'post', uri: 'at://post', excerpt: 'hello' },
	target_url: 'https://bsky.app/profile/me/post/3k',
	created_at: '2026-05-11T12:34:56Z',
	is_read: false,
};

const baseProps = {
	items: [ baseItem ],
	isLoading: false,
	isError: false,
	hasMore: false,
	onLoadMore: jest.fn(),
};

describe( 'SocialNotificationsList', () => {
	it( 'renders an empty state when items is empty and not loading', () => {
		renderWithProvider( <SocialNotificationsList { ...baseProps } items={ [] } /> );
		expect( screen.getByText( /no notifications yet/i ) ).toBeVisible();
	} );

	it( 'renders a spinner when loading the first page', () => {
		renderWithProvider( <SocialNotificationsList { ...baseProps } items={ [] } isLoading /> );
		expect( screen.getByRole( 'status' ) ).toBeVisible();
	} );

	it( 'renders an error state when isError is true with no items', () => {
		renderWithProvider( <SocialNotificationsList { ...baseProps } items={ [] } isError /> );
		expect( screen.getByText( /couldn’t load notifications/i ) ).toBeVisible();
	} );

	it( 'renders items', () => {
		renderWithProvider( <SocialNotificationsList { ...baseProps } /> );
		expect( screen.getByText( /liked your post/i ) ).toBeVisible();
	} );

	it( 'shows Load more when hasMore is true and triggers onLoadMore', async () => {
		const onLoadMore = jest.fn();
		const user = userEvent.setup();
		renderWithProvider(
			<SocialNotificationsList { ...baseProps } hasMore onLoadMore={ onLoadMore } />
		);
		await user.click( screen.getByRole( 'button', { name: /load more/i } ) );
		expect( onLoadMore ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'does not render Load more when hasMore is false', () => {
		renderWithProvider( <SocialNotificationsList { ...baseProps } hasMore={ false } /> );
		expect( screen.queryByRole( 'button', { name: /load more/i } ) ).toBeNull();
	} );

	it( 'disables Load more while fetching the next page', () => {
		renderWithProvider( <SocialNotificationsList { ...baseProps } hasMore isLoadingMore /> );
		expect( screen.getByRole( 'button', { name: /load more/i } ) ).toBeDisabled();
	} );

	it( 'shows a retry footer when pagination errors with items present', async () => {
		const onLoadMore = jest.fn();
		const user = userEvent.setup();
		renderWithProvider(
			<SocialNotificationsList { ...baseProps } hasMore isError onLoadMore={ onLoadMore } />
		);
		expect( screen.getByText( /couldn’t load more notifications/i ) ).toBeVisible();
		// The plain "Load more" button is replaced by the retry CTA.
		expect( screen.queryByRole( 'button', { name: /load more/i } ) ).toBeNull();
		await user.click( screen.getByRole( 'button', { name: /try again/i } ) );
		expect( onLoadMore ).toHaveBeenCalledTimes( 1 );
	} );
} );
