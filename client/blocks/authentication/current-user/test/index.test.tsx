/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import CurrentUser from '../index';

const defaultProps = {
	avatarUrl: 'https://gravatar.com/avatar/0?d=mp&s=96',
	name: 'Jane Doe',
	email: 'jane@example.com',
};

describe( 'CurrentUser', () => {
	test( 'renders the user name', () => {
		render( <CurrentUser { ...defaultProps } /> );

		expect( screen.getByText( 'Jane Doe' ) ).toBeVisible();
	} );

	test( 'renders the user email', () => {
		render( <CurrentUser { ...defaultProps } /> );

		expect( screen.getByText( 'jane@example.com' ) ).toBeVisible();
	} );

	test( 'renders the avatar with empty alt for decorative use', () => {
		const { container } = render( <CurrentUser { ...defaultProps } /> );

		const avatar = container.querySelector( '.auth-current-user__avatar' );
		expect( avatar ).toHaveAttribute( 'src', defaultProps.avatarUrl );
		expect( avatar ).toHaveAttribute( 'alt', '' );
	} );
} );
