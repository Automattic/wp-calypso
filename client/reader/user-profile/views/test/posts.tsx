/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues

import { render, screen } from '@testing-library/react';
import React from 'react';
import { UserData } from 'calypso/lib/user/user';
import UserPosts from '../posts';

jest.mock(
	'calypso/reader/stream',
	() =>
		( {
			streamKey,
			className,
			emptyContent,
			showFollowButton,
			showSiteNameOnCards,
			sidebarTabTitle,
			useCompactCards,
			showBack,
		} ) => (
			<div data-testid="reader-stream" data-stream-key={ streamKey } className={ className }>
				<div data-testid="stream-props">
					<span data-prop="showFollowButton">{ String( showFollowButton ) }</span>
					<span data-prop="showSiteNameOnCards">{ String( showSiteNameOnCards ) }</span>
					<span data-prop="sidebarTabTitle">{ sidebarTabTitle }</span>
					<span data-prop="useCompactCards">{ String( useCompactCards ) }</span>
					<span data-prop="showBack">{ String( showBack ) }</span>
				</div>
				{ emptyContent && <div data-testid="empty-content">{ emptyContent() }</div> }
			</div>
		)
);

jest.mock( 'calypso/components/empty-content', () => ( { icon, line } ) => (
	<div data-testid="empty-content-component">
		{ icon && <div data-testid="empty-content-icon">{ icon }</div> }
		{ line && <p data-testid="empty-content-line">{ line }</p> }
	</div>
) );

describe( 'UserPosts', () => {
	const defaultUser: UserData = {
		ID: 123,
		user_login: 'testuser',
		display_name: 'Test User',
		avatar_URL: 'https://example.com/avatar.jpg',
	};

	test( 'should render Stream component with correct props', () => {
		render( <UserPosts user={ defaultUser } /> );

		// Stream component should be rendered
		const streamComponent = screen.getByTestId( 'reader-stream' );
		expect( streamComponent ).toBeInTheDocument();

		// Stream key should include user ID
		expect( streamComponent ).toHaveAttribute( 'data-stream-key', `user:${ defaultUser.ID }` );

		// Class name should indicate user profile
		expect( streamComponent ).toHaveClass( 'is-user-profile' );

		// Props should be correctly set
		const propsContainer = screen.getByTestId( 'stream-props' );
		expect( propsContainer.querySelector( '[data-prop="showFollowButton"]' ) ).toHaveTextContent(
			'false'
		);
		expect( propsContainer.querySelector( '[data-prop="showSiteNameOnCards"]' ) ).toHaveTextContent(
			'true'
		);
		expect( propsContainer.querySelector( '[data-prop="sidebarTabTitle"]' ) ).toHaveTextContent(
			'Related'
		);
		// @ts-expect-error -- jest-dom matchers are available globally
		expect( propsContainer.querySelector( '[data-prop="useCompactCards"]' ) ).toHaveTextContent(
			'true'
		);
		expect( propsContainer.querySelector( '[data-prop="showBack"]' ) ).toHaveTextContent( 'false' );
	} );

	test( 'should provide empty content function that renders correctly', () => {
		render( <UserPosts user={ defaultUser } /> );

		// Empty content should be present
		const emptyContent = screen.getByTestId( 'empty-content' );
		expect( emptyContent ).toBeInTheDocument();

		// Empty content component should render inside
		expect(
			emptyContent.querySelector( '[data-testid="empty-content-component"]' )
		).toBeInTheDocument();

		// Icon should be present
		expect(
			emptyContent.querySelector( '[data-testid="empty-content-icon"]' )
		).toBeInTheDocument();

		// "No posts yet" message should be displayed
		expect( emptyContent.querySelector( '[data-testid="empty-content-line"]' ) ).toHaveTextContent(
			'No posts yet.'
		);
	} );
} );
