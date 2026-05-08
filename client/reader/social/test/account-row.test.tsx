/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SocialAccountRow } from '../account-row';

describe( 'SocialAccountRow', () => {
	const baseProps = {
		avatarUrl: 'https://cdn.test/avatar.jpg',
		displayName: 'Alice',
		handle: 'alice.bsky.social',
		biography: 'designer',
		profileHref: '/reader/atmosphere/1/profile/alice.bsky.social',
	};

	it( 'renders avatar, display name, handle, and bio', () => {
		render( <SocialAccountRow { ...baseProps } /> );
		expect( screen.getByText( 'Alice' ) ).toBeInTheDocument();
		expect( screen.getByText( '@alice.bsky.social' ) ).toBeInTheDocument();
		expect( screen.getByText( 'designer' ) ).toBeInTheDocument();
		expect( screen.getByRole( 'img' ) ).toHaveAttribute( 'src', 'https://cdn.test/avatar.jpg' );
	} );

	it( 'renders the row as a link to the profile', () => {
		render( <SocialAccountRow { ...baseProps } /> );
		const link = screen.getByRole( 'link', { name: /Alice/i } );
		expect( link ).toHaveAttribute( 'href', baseProps.profileHref );
	} );

	it( 'renders "Follows you" badge when followed_by is true', () => {
		render(
			<SocialAccountRow
				{ ...baseProps }
				followState={ {
					isFollowing: false,
					isFollowedBy: true,
					onFollow: jest.fn(),
					onUnfollow: jest.fn(),
				} }
			/>
		);
		expect( screen.getByText( /Follows you/i ) ).toBeInTheDocument();
	} );

	it( 'omits the follow button when isSelf is true', () => {
		render( <SocialAccountRow { ...baseProps } isSelf /> );
		expect( screen.queryByRole( 'button' ) ).not.toBeInTheDocument();
	} );

	it( 'calls onFollow without navigating when follow button is clicked', async () => {
		const user = userEvent.setup();
		const onFollow = jest.fn();
		render(
			<SocialAccountRow
				{ ...baseProps }
				followState={ {
					isFollowing: false,
					isFollowedBy: false,
					onFollow,
					onUnfollow: jest.fn(),
				} }
			/>
		);
		await user.click( screen.getByRole( 'button', { name: /^Follow$/i } ) );
		expect( onFollow ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'omits bio when biography is empty', () => {
		render( <SocialAccountRow { ...baseProps } biography="" /> );
		expect( screen.queryByText( 'designer' ) ).not.toBeInTheDocument();
	} );
} );
