/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComponentProps } from 'react';
import UserAvatar from '../index';

jest.mock( 'calypso/components/gravatar-with-hovercards', () => ( {
	__esModule: true,
	default: ( { size }: { size: number } ) => (
		<img data-testid="gravatar" data-size={ size } alt="gravatar" />
	),
} ) );

describe( 'UserAvatar', () => {
	const mockUser: ComponentProps< typeof UserAvatar >[ 'user' ] = {
		ID: 123,
		avatar_URL: 'https://example.com/avatar.jpg',
		display_name: 'Test User',
		name: 'Test User',
		login: 'test_user',
		wpcom_login: 'test_user',
	};

	test( 'should accept a custom className', () => {
		const { container } = render( <UserAvatar user={ mockUser } className="custom-class" /> );

		expect( container.querySelector( '.user-avatar' ) ).toHaveClass( 'custom-class' );
	} );

	test( 'should use size 32 by default', () => {
		render( <UserAvatar user={ mockUser } /> );

		expect( screen.getByTestId( 'gravatar' ) ).toHaveAttribute( 'data-size', '32' );
	} );

	test( 'should use custom size when provided', () => {
		render( <UserAvatar user={ mockUser } size={ 64 } /> );

		expect( screen.getByTestId( 'gravatar' ) ).toHaveAttribute( 'data-size', '64' );
	} );

	test( 'should wrap avatar in link when user has wpcom_login', () => {
		const { container } = render( <UserAvatar user={ mockUser } /> );

		const link = container.querySelector( 'a' );
		expect( link ).toBeInTheDocument();
		expect( link ).toHaveAttribute( 'href', '/reader/users/test_user' );
	} );

	test( 'should not wrap avatar in link when user has no wpcom_login', () => {
		const userWithoutLogin = { ...mockUser, wpcom_login: undefined, login: undefined };
		const { container } = render( <UserAvatar user={ userWithoutLogin } /> );

		expect( container.querySelector( 'a' ) ).not.toBeInTheDocument();
	} );

	test( 'should call onClick handler when clicked', async () => {
		const handleClick = jest.fn();
		const { container } = render( <UserAvatar user={ mockUser } onClick={ handleClick } /> );

		await userEvent.click( container.querySelector( '.user-avatar' )! );

		expect( handleClick ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'should render gravatar with null user which then show the default user icon', () => {
		const { container } = render( <UserAvatar user={ null } /> );

		expect( container.querySelector( '.user-avatar' ) ).toBeInTheDocument();
		expect( container.querySelector( 'a' ) ).not.toBeInTheDocument();
		expect( screen.getByTestId( 'gravatar' ) ).toBeInTheDocument();
	} );

	test( 'should render gravatar with undefined user which then show the default user icon', () => {
		const { container } = render( <UserAvatar /> );

		expect( container.querySelector( '.user-avatar' ) ).toBeInTheDocument();
		expect( container.querySelector( 'a' ) ).not.toBeInTheDocument();
		expect( screen.getByTestId( 'gravatar' ) ).toBeInTheDocument();
	} );
} );
