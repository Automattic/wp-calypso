/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProvider as render } from 'calypso/test-helpers/testing-library';
import { SocialAccountMenuItem } from '../social-account-menu-item';

describe( 'SocialAccountMenuItem', () => {
	const baseProps = {
		avatarUrl: null,
		displayName: 'Alice',
		handle: 'alice.bsky.social',
		href: '/reader/atmosphere/42/timeline',
		isSelected: false,
	};

	it( 'renders display name as primary and handle as byline', () => {
		render( <SocialAccountMenuItem { ...baseProps } /> );
		expect( screen.getByText( 'Alice' ) ).toBeVisible();
		expect( screen.getByText( 'alice.bsky.social' ) ).toBeVisible();
	} );

	it( 'renders as a link to href', () => {
		render( <SocialAccountMenuItem { ...baseProps } /> );
		expect( screen.getByRole( 'link', { name: /Alice/ } ) ).toHaveAttribute(
			'href',
			'/reader/atmosphere/42/timeline'
		);
	} );

	it( 'marks the item as selected when isSelected is true', () => {
		const { container } = render( <SocialAccountMenuItem { ...baseProps } isSelected /> );
		// MenuItem emits `selected` on the rendered <li>; no aria-current today,
		// so the class contract is the stable hook for sidebar styles.
		expect( container.querySelector( 'li.selected' ) ).not.toBeNull();
	} );

	it( 'fires onClick when link is clicked', async () => {
		const user = userEvent.setup();
		const onClick = jest.fn();
		render( <SocialAccountMenuItem { ...baseProps } onClick={ onClick } /> );
		await user.click( screen.getByRole( 'link', { name: /Alice/ } ) );
		expect( onClick ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'renders avatar image when avatarUrl is provided', () => {
		const { container } = render(
			<SocialAccountMenuItem { ...baseProps } avatarUrl="https://cdn/avatar.png" />
		);
		// Avatar is decorative (alt=""), so it has role="presentation" and
		// isn't discoverable via getByRole('img'). Query the element directly.
		const img = container.querySelector( 'img.sidebar-social__account-avatar' );
		expect( img ).toHaveAttribute( 'src', 'https://cdn/avatar.png' );
	} );
} );
