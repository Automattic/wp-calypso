/**
 * @jest-environment jsdom
 */
import { readUserListsQuery } from '@automattic/api-queries';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import React from 'react';
import { List } from 'calypso/reader/list-manage/types';
import { UserLists } from '../lists';
import type { ReaderUser } from '@automattic/api-core';

jest.mock( 'calypso/components/empty-content', () => ( { icon, line }: any ) => (
	<div data-testid="empty-content">
		{ icon && <div data-testid="empty-content-icon">{ icon }</div> }
		{ line && <p data-testid="empty-content-line">{ line }</p> }
	</div>
) );

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

function createQueryClient() {
	return new QueryClient( {
		defaultOptions: { queries: { retry: false } },
	} );
}

function renderWithQueryClient(
	ui: React.ReactElement,
	{ queryClient = createQueryClient() }: { queryClient?: QueryClient } = {}
) {
	return render( <QueryClientProvider client={ queryClient }>{ ui }</QueryClientProvider> );
}

describe( 'UserLists', () => {
	beforeEach( () => nock.disableNetConnect() );
	afterEach( () => {
		nock.cleanAll();
		nock.enableNetConnect();
	} );

	test( 'should render empty content when user has no lists', async () => {
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1/read/lists/test_user' )
			.reply( 200, { lists: [] } );

		renderWithQueryClient( <UserLists user={ defaultUser } /> );

		await waitFor( () => {
			expect( screen.getByTestId( 'empty-content' ) ).toBeInTheDocument();
		} );
		expect( screen.getByTestId( 'empty-content-icon' ) ).toBeInTheDocument();
		expect( screen.getByTestId( 'empty-content-line' ) ).toHaveTextContent( 'No lists yet.' );
	} );

	test( 'should render spinner when in loading state', () => {
		// Delay the response so the query stays pending while we assert.
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1/read/lists/test_user' )
			.delay( 30000 )
			.reply( 200, { lists: [] } );

		const { container } = renderWithQueryClient( <UserLists user={ defaultUser } /> );

		expect( container.querySelector( '.user-profile__loader' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Loading lists...' ) ).toBeInTheDocument();
	} );

	test( 'should render lists when user has lists', async () => {
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

		const queryClient = createQueryClient();
		queryClient.setQueryData( readUserListsQuery( 'test_user' ).queryKey, { lists: mockLists } );

		renderWithQueryClient( <UserLists user={ defaultUser } />, { queryClient } );

		const listsContainer = document.querySelector( '.user-profile__lists' );
		expect( listsContainer ).toBeInTheDocument();

		expect( screen.getByText( 'Test List 1' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Test List 2' ) ).toBeInTheDocument();
		expect( screen.getByText( 'This is test list 1' ) ).toBeInTheDocument();
		expect( screen.getByText( 'This is test list 2' ) ).toBeInTheDocument();

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

		const queryClient = createQueryClient();
		queryClient.setQueryData( readUserListsQuery( 'test_user' ).queryKey, { lists: mockLists } );

		renderWithQueryClient( <UserLists user={ defaultUser } />, { queryClient } );

		expect( screen.getByText( 'Recommended Blogs' ) ).toBeInTheDocument();
		expect(
			screen.getByText( 'A list of blogs recommended by @anotheruser.' )
		).toBeInTheDocument();

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

		const queryClient = createQueryClient();
		queryClient.setQueryData( readUserListsQuery( 'test_user' ).queryKey, { lists: mockLists } );

		renderWithQueryClient( <UserLists user={ defaultUser } />, { queryClient } );

		expect( screen.getByText( 'Test List' ) ).toBeInTheDocument();
		expect( screen.getByText( 'No description.' ) ).toBeInTheDocument();
	} );
} );
