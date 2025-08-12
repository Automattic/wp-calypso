/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues

import { render, screen } from '@testing-library/react';
import React from 'react';
import { UserData } from 'calypso/lib/user/user';
import { List } from 'calypso/reader/list-manage/types';
import { UserLists } from '../lists';

jest.mock( 'calypso/components/empty-content', () => ( { icon, line } ) => (
	<div data-testid="empty-content">
		{ icon && <div data-testid="empty-content-icon">{ icon }</div> }
		{ line && <p data-testid="empty-content-line">{ line }</p> }
	</div>
) );

describe( 'UserLists', () => {
	const defaultUser: UserData = {
		ID: 123,
		user_login: 'testuser',
		display_name: 'Test User',
		avatar_URL: 'https://example.com/avatar.jpg',
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

	test( 'should render nothing when in loading state', () => {
		const { container } = render(
			<UserLists user={ defaultUser } requestUserLists={ mockRequestUserLists } isLoading />
		);

		// Container should be empty
		expect( container ).toBeEmptyDOMElement();
	} );

	test( 'should render lists when user has lists', () => {
		const mockLists: List[] = [
			{
				ID: 1,
				title: 'Test List 1',
				description: 'This is test list 1',
				slug: 'test-list-1',
				owner: 'testuser',
				is_public: true,
				is_owner: true,
			},
			{
				ID: 2,
				title: 'Test List 2',
				description: 'This is test list 2',
				slug: 'test-list-2',
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

		const listsContainer = document.querySelector( '.user-profile__lists-body' );
		expect( listsContainer ).toBeInTheDocument();

		// List titles should be displayed
		expect( screen.getByText( 'Test List 1' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Test List 2' ) ).toBeInTheDocument();

		// List descriptions should be displayed
		expect( screen.getByText( 'This is test list 1' ) ).toBeInTheDocument();
		expect( screen.getByText( 'This is test list 2' ) ).toBeInTheDocument();

		// Links should be correct
		const links = Array.from( document.querySelectorAll( 'a.user-profile__lists-body-link' ) );
		expect( links ).toHaveLength( 2 );
		expect( links[ 0 ].getAttribute( 'href' ) ).toBe(
			`/reader/list/${ defaultUser.user_login }/test-list-1`
		);
		expect( links[ 1 ].getAttribute( 'href' ) ).toBe(
			`/reader/list/${ defaultUser.user_login }/test-list-2`
		);
	} );
} );
