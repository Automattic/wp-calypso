/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import React from 'react';
import { UserLists } from '../lists';

// Mock the EmptyContent component
jest.mock( 'calypso/components/empty-content', () => ( {
	__esModule: true,
	default: ( { icon, line } ) => (
		<div data-testid="empty-content">
			{ icon && <div data-testid="empty-content-icon">{ icon }</div> }
			{ line && <p data-testid="empty-content-line">{ line }</p> }
		</div>
	),
} ) );

describe( 'UserLists', () => {
	const defaultUser = {
		ID: 123,
		user_login: 'testuser',
		display_name: 'Test User',
		avatar_URL: 'https://example.com/avatar.jpg',
	};

	const mockRequestUserLists = jest.fn();

	/**
	 * Test: Empty state when user has no lists
	 *
	 * Verifies that:
	 * 1. Empty content component is displayed when no lists are available
	 * 2. The requestUserLists function is called with the username
	 */
	test( 'should render empty content when user has no lists', () => {
		render(
			<UserLists
				user={ defaultUser }
				requestUserLists={ mockRequestUserLists }
				lists={ [] }
				isLoading={ false }
			/>
		);

		// Empty content should be displayed
		// @ts-expect-error -- jest-dom matchers are available globally
		expect( screen.getByTestId( 'empty-content' ) ).toBeInTheDocument();

		// Icon should be displayed
		// @ts-expect-error -- jest-dom matchers are available globally
		expect( screen.getByTestId( 'empty-content-icon' ) ).toBeInTheDocument();

		// "No lists yet" message should be displayed
		// @ts-expect-error -- jest-dom matchers are available globally
		expect( screen.getByTestId( 'empty-content-line' ) ).toHaveTextContent( 'No lists yet.' );

		// Request function should be called with the username
		expect( mockRequestUserLists ).toHaveBeenCalledWith( defaultUser.user_login );
	} );

	/**
	 * Test: Loading state
	 *
	 * Verifies that:
	 * 1. The component renders nothing when in loading state
	 */
	test( 'should render nothing when in loading state', () => {
		const { container } = render(
			<UserLists user={ defaultUser } requestUserLists={ mockRequestUserLists } isLoading />
		);

		// Container should be empty
		// @ts-expect-error -- jest-dom matchers are available globally
		expect( container ).toBeEmptyDOMElement();
	} );

	/**
	 * Test: Lists rendering
	 *
	 * Verifies that:
	 * 1. Lists are rendered when user has lists
	 * 2. Each list shows proper title and description
	 * 3. Each list links to the correct URL
	 */
	test( 'should render lists when user has lists', () => {
		const mockLists = [
			{
				ID: 1,
				title: 'Test List 1',
				description: 'This is test list 1',
				slug: 'test-list-1',
				owner: defaultUser.user_login,
				is_public: true,
				is_owner: true,
			},
			{
				ID: 2,
				title: 'Test List 2',
				description: 'This is test list 2',
				slug: 'test-list-2',
				owner: defaultUser.user_login,
				is_public: true,
				is_owner: true,
			},
		];

		render(
			<UserLists
				user={ defaultUser }
				requestUserLists={ mockRequestUserLists }
				lists={ mockLists }
				isLoading={ false }
			/>
		);

		const listsContainer = document.querySelector( '.user-profile__lists-body' );
		// @ts-expect-error -- jest-dom matchers are available globally
		expect( listsContainer ).toBeInTheDocument();

		// List titles should be displayed
		// @ts-expect-error -- jest-dom matchers are available globally
		expect( screen.getByText( 'Test List 1' ) ).toBeInTheDocument();
		// @ts-expect-error -- jest-dom matchers are available globally
		expect( screen.getByText( 'Test List 2' ) ).toBeInTheDocument();

		// List descriptions should be displayed
		// @ts-expect-error -- jest-dom matchers are available globally
		expect( screen.getByText( 'This is test list 1' ) ).toBeInTheDocument();
		// @ts-expect-error -- jest-dom matchers are available globally
		expect( screen.getByText( 'This is test list 2' ) ).toBeInTheDocument();

		// Links should be correct
		const links = Array.from( document.querySelectorAll( 'a.user-profile__lists-body-link' ) );
		// @ts-expect-error -- jest matchers are available globally
		expect( links ).toHaveLength( 2 );
		expect( links[ 0 ].getAttribute( 'href' ) ).toBe(
			`/reader/list/${ defaultUser.user_login }/test-list-1`
		);
		expect( links[ 1 ].getAttribute( 'href' ) ).toBe(
			`/reader/list/${ defaultUser.user_login }/test-list-2`
		);
	} );
} );
