/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { FediFollowAllButton } from '../fedi-follow-button';
import type { PublicListItem } from '../use-public-list-query';

const mockFollowAll = jest.fn();
const mockDisconnect = jest.fn();

type MockConnectionState = {
	instance: string | null;
	isAuthenticating: boolean;
	isFollowing: boolean;
	followResults: Array< { success: boolean } >;
	followProgress: [ number, number ];
	error: string | null;
	pendingAction: string | null;
};

let mockState: MockConnectionState = {
	instance: null,
	isAuthenticating: false,
	isFollowing: false,
	followResults: [],
	followProgress: [ 0, 0 ],
	error: null,
	pendingAction: null,
};

jest.mock( 'calypso/lib/fediverse', () => ( {
	useFediConnectionContext: () => [
		mockState,
		{
			connect: jest.fn(),
			followAll: mockFollowAll,
			followOne: jest.fn(),
			disconnect: mockDisconnect,
			clearResults: jest.fn(),
		},
	],
} ) );

function setState( overrides: Partial< MockConnectionState > ): void {
	mockState = {
		instance: null,
		isAuthenticating: false,
		isFollowing: false,
		followResults: [],
		followProgress: [ 0, 0 ],
		error: null,
		pendingAction: null,
		...overrides,
	};
}

function item( overrides: Partial< PublicListItem > = {} ): PublicListItem {
	return {
		blog_id: null,
		feed_id: 0,
		site_name: 'Site',
		site_url: 'https://site.example',
		site_icon: null,
		fediverse_handle: null,
		fediverse_handle_url: null,
		...overrides,
	};
}

const fediItems: PublicListItem[] = [
	item( { fediverse_handle: '@alice@example.social', site_name: 'Alice' } ),
	item( { fediverse_handle: '@bob@example.social', site_name: 'Bob' } ),
];

describe( 'FediFollowAllButton', () => {
	beforeEach( () => {
		setState( {} );
		mockFollowAll.mockClear();
		mockDisconnect.mockClear();
	} );

	test( 'renders nothing when there are no fediverse accounts', () => {
		const { container } = renderWithProvider(
			<FediFollowAllButton items={ [ item( { fediverse_handle: null } ) ] } listSlug="my-list" />
		);
		expect( container ).toBeEmptyDOMElement();
	} );

	test( 'opens the connect modal when clicked while disconnected', async () => {
		const user = userEvent.setup();
		renderWithProvider( <FediFollowAllButton items={ fediItems } listSlug="my-list" /> );

		await user.click( screen.getByRole( 'button', { name: /social web/i } ) );

		expect( screen.getByRole( 'dialog' ) ).toBeVisible();
		expect( screen.getByText( /enter your mastodon or fediverse instance/i ) ).toBeVisible();
		expect( mockFollowAll ).not.toHaveBeenCalled();
	} );

	test( 'calls followAll directly when already connected', async () => {
		setState( { instance: 'example.social' } );
		const user = userEvent.setup();
		renderWithProvider( <FediFollowAllButton items={ fediItems } listSlug="my-list" /> );

		await user.click( screen.getByRole( 'button', { name: /social web/i } ) );

		expect( mockFollowAll ).toHaveBeenCalledWith(
			'example.social',
			'my-list',
			expect.arrayContaining( [
				expect.objectContaining( { username: 'alice', instance: 'example.social' } ),
				expect.objectContaining( { username: 'bob', instance: 'example.social' } ),
			] )
		);
	} );

	test( 'shows "Following…" progress label while a follow is running', () => {
		setState( {
			instance: 'example.social',
			isFollowing: true,
			followProgress: [ 1, 3 ],
		} );
		renderWithProvider( <FediFollowAllButton items={ fediItems } listSlug="my-list" /> );

		expect( screen.getByRole( 'button', { name: /following.*1\/3/i } ) ).toBeVisible();
	} );

	test( 'submits instance domain from the modal', async () => {
		const user = userEvent.setup();
		renderWithProvider( <FediFollowAllButton items={ fediItems } listSlug="my-list" /> );

		await user.click( screen.getByRole( 'button', { name: /social web/i } ) );
		await user.type(
			screen.getByRole( 'textbox', { name: /instance domain/i } ),
			'example.social'
		);
		await user.click( screen.getByRole( 'button', { name: /connect & follow/i } ) );

		expect( mockFollowAll ).toHaveBeenCalledWith(
			'example.social',
			'my-list',
			expect.any( Array )
		);
	} );
} );
