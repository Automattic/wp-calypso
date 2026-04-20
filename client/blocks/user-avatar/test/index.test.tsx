/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserAvatar, { UserAvatarInfo } from '../index';

jest.mock( '@tanstack/react-query', () => ( {
	...jest.requireActual( '@tanstack/react-query' ),
	useQuery: jest.fn(),
} ) );

jest.mock( 'calypso/blocks/user-avatar/user-hovercard', () => ( {
	__esModule: true,
	default: () => <div data-testid="user-hovercard" />,
} ) );

describe( 'UserAvatar', () => {
	const defaultUser: UserAvatarInfo = {
		avatar_URL: 'https://gravatar.com/avatar/abc123',
		display_name: 'Test User',
		wpcom_login: 'testuser',
		wpcom_id: 123,
	};

	test( 'renders avatar image when avatar_URL is provided', () => {
		render( <UserAvatar user={ defaultUser } size={ 48 } /> );

		const img = document.querySelector( '.user-avatar__image' );
		expect( img ).toBeVisible();
		expect( img ).toHaveAttribute( 'width', '48' );
		expect( img ).toHaveAttribute( 'height', '48' );
	} );

	test( 'renders default avatar icon when avatar_URL is not provided', () => {
		render( <UserAvatar user={ { ...defaultUser, avatar_URL: undefined } } /> );

		const svg = document.querySelector( '.user-avatar svg' );
		expect( svg ).toBeVisible();
		expect( document.querySelector( '.user-avatar__image' ) ).not.toBeInTheDocument();
	} );

	test( 'renders default avatar when user is null', () => {
		render( <UserAvatar user={ null } /> );

		expect( document.querySelector( '.user-avatar__image' ) ).not.toBeInTheDocument();
		expect( document.querySelector( '.user-avatar svg' ) ).toBeVisible();
	} );

	test( 'uses default size of 32', () => {
		render( <UserAvatar user={ defaultUser } /> );

		const img = document.querySelector( '.user-avatar__image' );
		expect( img ).toHaveAttribute( 'width', '32' );
		expect( img ).toHaveAttribute( 'height', '32' );
	} );

	test( 'wraps avatar in profile link when wpcom_login is provided', () => {
		render( <UserAvatar user={ defaultUser } /> );

		const link = document.querySelector( '.user-avatar a' );
		expect( link ).toHaveAttribute( 'href', '/reader/users/testuser' );
	} );

	test( 'does not wrap avatar in link when wpcom_login is not provided', () => {
		render( <UserAvatar user={ { ...defaultUser, wpcom_login: undefined } } /> );

		expect( document.querySelector( '.user-avatar a' ) ).not.toBeInTheDocument();
	} );

	test( 'does not show hovercard when hideHovercard is true', async () => {
		render( <UserAvatar user={ defaultUser } hideHovercard /> );

		await userEvent.hover( document.querySelector( '.user-avatar' )! );

		expect( screen.queryByTestId( 'user-hovercard' ) ).not.toBeInTheDocument();
	} );

	test( 'does not show hovercard when user is null', async () => {
		render( <UserAvatar user={ null } /> );

		await userEvent.hover( document.querySelector( '.user-avatar' )! );

		expect( screen.queryByTestId( 'user-hovercard' ) ).not.toBeInTheDocument();
	} );

	test( 'shows hovercard on mouse enter', async () => {
		render( <UserAvatar user={ defaultUser } /> );
		expect( screen.queryByTestId( 'user-hovercard' ) ).not.toBeInTheDocument();

		await userEvent.hover( document.querySelector( '.user-avatar' )! );
		expect( screen.getByTestId( 'user-hovercard' ) ).toBeInTheDocument();
	} );

	test( 'hides hovercard on mouse leave', async () => {
		render( <UserAvatar user={ defaultUser } /> );

		await userEvent.hover( document.querySelector( '.user-avatar' )! );
		expect( screen.getByTestId( 'user-hovercard' ) ).toBeInTheDocument();

		await userEvent.unhover( document.querySelector( '.user-avatar' )! );
		expect( screen.queryByTestId( 'user-hovercard' ) ).not.toBeInTheDocument();
	} );
} );
