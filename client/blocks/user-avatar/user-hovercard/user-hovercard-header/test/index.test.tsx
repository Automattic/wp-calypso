/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { ComponentProps } from 'react';
import UserHovercardHeader from '../index';

describe( 'UserHovercardHeader', () => {
	const defaultUser: ComponentProps< typeof UserHovercardHeader >[ 'user' ] = {
		ID: 1,
		user_login: 'testuser',
		display_name: 'Test User',
		first_name: 'Test',
		last_name: 'User',
		nice_name: 'testuser',
		description: 'A test user description',
		avatar_URL: 'https://gravatar.com/avatar/abc123',
		profile_URL: 'https://example.com/profile',
		primary_blog: null,
	};

	test( 'renders avatar image when avatar_URL is provided', () => {
		render( <UserHovercardHeader user={ defaultUser } /> );

		const img = document.querySelector( '.preloaded-image-wrapper img' );
		expect( img ).toBeVisible();
		expect( img ).toHaveAttribute( 'width', '102' );
		expect( img ).toHaveAttribute( 'height', '102' );
	} );

	test( 'renders default avatar icon when avatar_URL is not provided', () => {
		render( <UserHovercardHeader user={ { ...defaultUser, avatar_URL: '' } } /> );

		const svg = document.querySelector( '.user-hovercard__avatar svg' );
		expect( svg ).toBeVisible();
		expect( svg ).toHaveAttribute( 'width', '102' );
		expect( svg ).toHaveAttribute( 'height', '102' );
		expect( document.querySelector( '.preloaded-image-wrapper' ) ).not.toBeInTheDocument();
	} );

	test( 'renders display name', () => {
		render( <UserHovercardHeader user={ defaultUser } /> );

		expect( screen.getByRole( 'heading', { level: 4 } ) ).toHaveTextContent( 'Test User' );
	} );

	test( 'falls back to first_name + last_name when display_name is empty', () => {
		render( <UserHovercardHeader user={ { ...defaultUser, display_name: '' } } /> );

		expect( screen.getByRole( 'heading', { level: 4 } ) ).toHaveTextContent( 'Test User' );
	} );

	test( 'renders user description', () => {
		render( <UserHovercardHeader user={ defaultUser } /> );

		expect( screen.getByText( 'A test user description' ) ).toBeVisible();
	} );

	test( 'hides description when not provided', () => {
		render( <UserHovercardHeader user={ { ...defaultUser, description: '' } } /> );

		expect( screen.queryByText( 'A test user description' ) ).not.toBeInTheDocument();
	} );

	test( 'links avatar and name to user profile page', () => {
		render( <UserHovercardHeader user={ defaultUser } /> );

		const links = screen.getAllByRole( 'link' );
		links.forEach( ( link ) => {
			expect( link ).toHaveAttribute( 'href', '/reader/users/testuser' );
		} );
	} );

	test( 'does not set profile link when user_login is empty', () => {
		render( <UserHovercardHeader user={ { ...defaultUser, user_login: '' } } /> );

		expect( screen.queryAllByRole( 'link' ) ).toHaveLength( 0 );
	} );
} );
