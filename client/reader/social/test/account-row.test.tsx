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
		const { container } = render( <SocialAccountRow { ...baseProps } /> );
		expect( screen.getByText( 'Alice' ) ).toBeInTheDocument();
		expect( screen.getByText( '@alice.bsky.social' ) ).toBeInTheDocument();
		expect( screen.getByText( 'designer' ) ).toBeInTheDocument();
		// Avatar uses alt="" (decorative) — the display name is rendered
		// alongside it — so we can't query by role="img". Look up the
		// image directly to assert the src.
		const avatar = container.querySelector( 'img' );
		expect( avatar ).toHaveAttribute( 'src', 'https://cdn.test/avatar.jpg' );
		expect( avatar ).toHaveAttribute( 'alt', '' );
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

	it( 'suppresses the "Follows you" badge when hideFollowedByBadge is true, but keeps "Follow back"', () => {
		render(
			<SocialAccountRow
				{ ...baseProps }
				hideFollowedByBadge
				followState={ {
					isFollowing: false,
					isFollowedBy: true,
					onFollow: jest.fn(),
					onUnfollow: jest.fn(),
				} }
			/>
		);
		// Badge is suppressed even though isFollowedBy is true (e.g. on a
		// followers list where every row trivially follows the viewer).
		expect( screen.queryByText( /Follows you/i ) ).not.toBeInTheDocument();
		// The follow button still uses isFollowedBy to pick "Follow back".
		expect( screen.getByRole( 'button', { name: /^Follow back$/i } ) ).toBeInTheDocument();
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

	it( 'calls onUnfollow when the follow button is clicked while following', async () => {
		const user = userEvent.setup();
		const onFollow = jest.fn();
		const onUnfollow = jest.fn();
		render(
			<SocialAccountRow
				{ ...baseProps }
				followState={ {
					isFollowing: true,
					isFollowedBy: false,
					onFollow,
					onUnfollow,
				} }
			/>
		);
		await user.click( screen.getByRole( 'button', { name: /^Unfollow @alice\.bsky\.social$/i } ) );
		expect( onUnfollow ).toHaveBeenCalledTimes( 1 );
		expect( onFollow ).not.toHaveBeenCalled();
	} );

	it( 'shows "Follow back" when the target follows the viewer', () => {
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
		expect( screen.getByRole( 'button', { name: /^Follow back$/i } ) ).toBeInTheDocument();
	} );

	it( 'does not nest the follow button inside the profile link', async () => {
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
		const link = screen.getByRole( 'link', { name: /Alice/i } );
		const button = screen.getByRole( 'button', { name: /^Follow$/i } );

		// The follow button must not be a descendant of the profile anchor —
		// nested interactive content is invalid HTML and produces an
		// implementation-defined keyboard / AT story.
		expect( link.contains( button ) ).toBe( false );

		// Clicking the button does not bubble to the anchor (they are siblings),
		// so a click on the follow button cannot trigger profile navigation.
		const linkClick = jest.fn();
		link.addEventListener( 'click', linkClick );
		await user.click( button );
		expect( onFollow ).toHaveBeenCalledTimes( 1 );
		expect( linkClick ).not.toHaveBeenCalled();
	} );

	it( 'forwards the handle to the follow button accessible name', () => {
		render(
			<SocialAccountRow
				{ ...baseProps }
				followState={ {
					isFollowing: true,
					isFollowedBy: false,
					onFollow: jest.fn(),
					onUnfollow: jest.fn(),
				} }
			/>
		);
		const button = screen.getByRole( 'button', { name: /alice\.bsky\.social/i } );
		expect( button ).toHaveAttribute( 'aria-label', 'Unfollow @alice.bsky.social' );
	} );
} );
