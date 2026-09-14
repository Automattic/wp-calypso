/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues

import { render, screen } from '@testing-library/react';
import React from 'react';
import UserPosts from '../posts';
import type { ReaderUser } from '@automattic/api-core';

jest.mock( 'calypso/state', () => ( {
	useSelector: jest.fn(),
} ) );

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
		} ) => (
			<div data-testid="reader-stream" data-stream-key={ streamKey } className={ className }>
				<div data-testid="stream-props">
					<span data-prop="showFollowButton">{ String( showFollowButton ) }</span>
					<span data-prop="showSiteNameOnCards">{ String( showSiteNameOnCards ) }</span>
					<span data-prop="sidebarTabTitle">{ sidebarTabTitle }</span>
					<span data-prop="useCompactCards">{ String( useCompactCards ) }</span>
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

jest.mock( 'calypso/reader/user-profile/components/private-tab-notice', () => ( {
	__esModule: true,
	default: ( { title }: { title: string } ) => (
		<div data-testid="private-tab-notice">{ title }</div>
	),
} ) );

describe( 'UserPosts', () => {
	const { useSelector } = jest.requireMock( 'calypso/state' );
	const defaultUser: ReaderUser = {
		ID: 123,
		user_login: 'test_user',
		nice_name: 'nice_name',
		display_name: 'Test User',
		avatar_URL: 'https://example.com/avatar.jpg',
		first_name: '',
		last_name: '',
		description: '',
		profile_URL: '',
	};

	beforeEach( () => {
		jest.clearAllMocks();
		// Default to a public viewer (not the profile owner).
		useSelector.mockReturnValue( null );
	} );

	test( 'should render Stream component with correct props', () => {
		render( <UserPosts user={ defaultUser } /> );

		// Stream component should be rendered
		const streamComponent = screen.getByTestId( 'reader-stream' );
		expect( streamComponent ).toBeInTheDocument();

		// Stream key should include user ID
		expect( streamComponent ).toHaveAttribute( 'data-stream-key', `user:${ defaultUser.ID }` );

		// Class name should indicate user profile
		expect( streamComponent ).toHaveClass( 'user-profile-posts' );

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

	test( 'should render the private-tab notice for the profile owner', () => {
		useSelector.mockReturnValue( { username: defaultUser.user_login } );

		render( <UserPosts user={ defaultUser } /> );

		expect( screen.getByTestId( 'private-tab-notice' ) ).toHaveTextContent(
			'Your posts are private'
		);
	} );

	test( 'should not render the private-tab notice for a public viewer', () => {
		render( <UserPosts user={ defaultUser } /> );

		expect( screen.queryByTestId( 'private-tab-notice' ) ).not.toBeInTheDocument();
	} );
} );
