/**
 * @jest-environment jsdom
 */
import { readSubscribedListsQuery } from '@automattic/api-queries';
import { QueryClient } from '@tanstack/react-query';
import { screen } from '@testing-library/react';
import nock from 'nock';
import documentHeadReducer from 'calypso/state/document-head/reducer';
import readerReducer from 'calypso/state/reader/reducer';
import uiReducer from 'calypso/state/ui/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import ReaderLists from '..';
import type { List } from 'calypso/reader/list-manage/types';

const reducers = {
	reader: readerReducer,
	documentHead: documentHeadReducer,
	ui: uiReducer,
};

function createQueryClient() {
	return new QueryClient( { defaultOptions: { queries: { retry: false } } } );
}

describe( 'ReaderLists', () => {
	beforeEach( () => nock.disableNetConnect() );

	afterEach( () => {
		nock.cleanAll();
		nock.enableNetConnect();
	} );

	test( 'renders heading and subtitle', () => {
		const queryClient = createQueryClient();
		queryClient.setQueryData( readSubscribedListsQuery().queryKey, { lists: [] } );

		renderWithProvider( <ReaderLists />, { reducers, queryClient } );

		expect( screen.getByRole( 'heading', { name: 'Lists' } ) ).toBeVisible();
		expect( document.querySelector( '.formatted-header__subtitle' ) ).toBeVisible();
	} );

	test( 'renders the empty state when there are no lists', () => {
		const queryClient = createQueryClient();
		queryClient.setQueryData( readSubscribedListsQuery().queryKey, { lists: [] } );

		renderWithProvider( <ReaderLists />, { reducers, queryClient } );

		expect( screen.getByText( 'No lists yet.' ) ).toBeVisible();
	} );

	test( 'renders every subscribed list', () => {
		const lists: List[] = [
			{
				ID: 1,
				title: 'My List 1',
				description: 'desc',
				slug: 'my-list-1',
				owner: 'test_user',
				is_public: true,
				is_owner: true,
			},
			{
				ID: 2,
				title: 'My List 2',
				description: 'desc',
				slug: 'my-list-2',
				owner: 'test_user',
				is_public: true,
				is_owner: false,
			},
			{
				ID: 3,
				title: 'My List 3',
				description: 'desc',
				slug: 'my-list-3',
				owner: 'test_user',
				is_public: false,
				is_owner: true,
			},
			{
				ID: 4,
				title: 'My List 4',
				description: 'desc',
				slug: 'my-list-4',
				owner: 'test_user',
				is_public: false,
				is_owner: false,
			},
			{
				ID: 5,
				title: 'Recommended List',
				description: 'desc',
				slug: 'recommended-list',
				owner: 'test_user',
				is_public: true,
				is_owner: false,
			},
			{
				ID: 6,
				title: 'My Recommended List',
				description: 'desc',
				slug: 'my-recommended-list',
				owner: 'test_user',
				is_public: true,
				is_owner: true,
			},
		];
		const queryClient = createQueryClient();
		queryClient.setQueryData( readSubscribedListsQuery().queryKey, { lists } );

		renderWithProvider( <ReaderLists />, { reducers, queryClient } );

		const links = Array.from(
			document.querySelectorAll< HTMLAnchorElement >( 'a.summary-button' )
		);
		expect( links.length ).toBe( 6 );
	} );
} );
