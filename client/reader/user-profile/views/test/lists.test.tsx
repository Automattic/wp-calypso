/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues

import { render, screen } from '@testing-library/react';
import React from 'react';
import { List } from 'calypso/reader/list-manage/types';
import { UserLists } from '../lists';
import type { ReaderUser } from '@automattic/api-core';

jest.mock( 'calypso/components/empty-content', () => ( { icon, line } ) => (
	<div data-testid="empty-content">
		{ icon && <div data-testid="empty-content-icon">{ icon }</div> }
		{ line && <p data-testid="empty-content-line">{ line }</p> }
	</div>
) );

describe( 'UserLists', () => {
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

	const mockRequestUserLists = jest.fn();

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
		expect( screen.getByTestId( 'empty-content' ) ).toBeInTheDocument();

		// Icon should be displayed
		expect( screen.getByTestId( 'empty-content-icon' ) ).toBeInTheDocument();

		// "No lists yet" message should be displayed
		expect( screen.getByTestId( 'empty-content-line' ) ).toHaveTextContent( 'No lists yet.' );

		// Request function should be called with the username
		expect( mockRequestUserLists ).toHaveBeenCalledWith( defaultUser.user_login );
	} );

	test( 'should render spinner when in loading state', () => {
		const { container } = render(
			<UserLists user={ defaultUser } requestUserLists={ mockRequestUserLists } isLoading />
		);

		expect( container.querySelector( '.user-profile__loader' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Loading lists...' ) ).toBeInTheDocument();
	} );

	test( 'should render lists when user has lists', () => {
		const mockLists: List[] = [
			{
				ID: 1,
				title: 'Test List 1',
				description: 'This is test list 1',
				slug: 'test-list-1',
				owner: 'test_user',
				is_public: true,
				is_owner: true,
			},
			{
				ID: 2,
				title: 'Test List 2',
				description: 'This is test list 2',
				slug: 'test-list-2',
				owner: 'test_user',
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

		const listsContainer = document.querySelector( '.user-profile__lists' );
		expect( listsContainer ).toBeInTheDocument();

		// List titles should be displayed
		expect( screen.getByText( 'Test List 1' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Test List 2' ) ).toBeInTheDocument();

		// List descriptions should be displayed
		expect( screen.getByText( 'This is test list 1' ) ).toBeInTheDocument();
		expect( screen.getByText( 'This is test list 2' ) ).toBeInTheDocument();

		// Links should be correct
		const links = Array.from( document.querySelectorAll( 'a.summary-button' ) );
		expect( links ).toHaveLength( 2 );
		expect( links[ 0 ].getAttribute( 'href' ) ).toBe(
			`/reader/list/${ defaultUser.user_login }/test-list-1`
		);
		expect( links[ 1 ].getAttribute( 'href' ) ).toBe(
			`/reader/list/${ defaultUser.user_login }/test-list-2`
		);
	} );

	test( 'should show recommended-blogs list from another user with custom description', () => {
		const mockLists: List[] = [
			{
				ID: 1,
				title: 'Recommended Blogs',
				description: '',
				slug: 'recommended-blogs',
				owner: 'anotheruser',
				is_public: true,
				is_owner: false,
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

		expect( screen.getByText( 'Recommended Blogs' ) ).toBeInTheDocument();
		expect(
			screen.getByText( 'A list of blogs recommended by @anotheruser.' )
		).toBeInTheDocument();

		// Link should point to the other user's list
		const link = document.querySelector( 'a.summary-button' );
		expect( link?.getAttribute( 'href' ) ).toBe( '/reader/list/anotheruser/recommended-blogs' );
	} );

	test( 'should display fallback description when list has no description', () => {
		const mockLists: List[] = [
			{
				ID: 1,
				title: 'Test List',
				description: '',
				slug: 'no-desc-list',
				owner: 'testuser',
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

		expect( screen.getByText( 'Test List' ) ).toBeInTheDocument();
		expect( screen.getByText( 'No description.' ) ).toBeInTheDocument();
	} );
} );
