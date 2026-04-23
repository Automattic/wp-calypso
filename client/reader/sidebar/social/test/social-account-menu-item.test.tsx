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

	it( 'applies selected class when isSelected is true', () => {
		const { container } = render( <SocialAccountMenuItem { ...baseProps } isSelected /> );
		expect( container.querySelector( '.is-selected' ) ).not.toBeNull();
	} );

	it( 'fires onClick when link is clicked', async () => {
		const user = userEvent.setup();
		const onClick = jest.fn();
		render( <SocialAccountMenuItem { ...baseProps } onClick={ onClick } /> );
		await user.click( screen.getByRole( 'link', { name: /Alice/ } ) );
		expect( onClick ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'renders avatar image when avatarUrl is provided', () => {
		render( <SocialAccountMenuItem { ...baseProps } avatarUrl="https://cdn/avatar.png" /> );
		const img = screen.getByRole( 'img' );
		expect( img ).toHaveAttribute( 'src', 'https://cdn/avatar.png' );
	} );
} );
