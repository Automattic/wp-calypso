/**
 * @jest-environment jsdom
 */
import { QueryClient } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import documentHeadReducer from 'calypso/state/document-head/reducer';
import readerReducer from 'calypso/state/reader/reducer';
import uiReducer from 'calypso/state/ui/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import ReaderList from '..';

// Stream has deep dependency chains (post cards, infinite scroll, data layer).
jest.mock( 'calypso/reader/stream', () => ( {
	__esModule: true,
	default: ( { children }: { children: React.ReactNode } ) => (
		<div data-testid="stream">{ children }</div>
	),
} ) );

// ListSites uses useInfiniteQuery with its own nock-based tests.
jest.mock( 'calypso/reader/list/views/sites', () => ( {
	__esModule: true,
	default: () => <div data-testid="list-sites" />,
} ) );

// ReaderListHeader uses useQuery and IntersectionObserver, tested separately.
jest.mock( 'calypso/reader/list/components/list-header', () => ( {
	__esModule: true,
	default: ( { view }: { view: string } ) => <div data-testid="list-header" data-view={ view } />,
} ) );

// ListEmpty uses data-layer query components, tested separately.
jest.mock( 'calypso/reader/list/components/empty', () => ( {
	__esModule: true,
	default: () => <div data-testid="list-empty" />,
} ) );

const reducers = {
	reader: readerReducer,
	documentHead: documentHeadReducer,
	ui: uiReducer,
};

const listData = {
	ID: 1,
	slug: 'my-list',
	title: 'My List',
	description: 'A test list',
	owner: 'test_user',
	is_owner: true,
	is_public: true,
};

function readerListsState( { list = listData }: { list?: typeof listData | null } = {} ) {
	return {
		reader: {
			lists: {
				items: list ? { [ list.ID ]: list } : {},
				listItems: {},
			},
		},
		currentUser: {
			user: { username: 'test_user' },
		},
	};
}

function createQueryClient() {
	return new QueryClient( {
		defaultOptions: { queries: { retry: false } },
	} );
}

describe( 'ReaderList', () => {
	beforeEach( () => nock.disableNetConnect() );
	afterEach( () => {
		nock.cleanAll();
		nock.enableNetConnect();
	} );

	test( 'renders missing state when list is not found after request', async () => {
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.2/read/lists/test_user/my-list' )
			.reply( 404, { error: 'not_found' } );

		renderWithProvider(
			<ReaderList owner="test_user" slug="my-list" view="posts" streamKey="list:1" />,
			{
				reducers,
				initialState: readerListsState( { list: null } ),
				queryClient: createQueryClient(),
			}
		);

		await waitFor( () => {
			expect( screen.getByText( 'List not found' ) ).toBeVisible();
		} );
	} );

	test( 'renders Stream for the default posts view', async () => {
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.2/read/lists/test_user/my-list' )
			.reply( 200, { list: listData } );

		renderWithProvider(
			<ReaderList owner="test_user" slug="my-list" view="posts" streamKey="list:1" />,
			{ reducers, initialState: readerListsState(), queryClient: createQueryClient() }
		);

		await waitFor( () => {
			expect( screen.getByTestId( 'stream' ) ).toBeVisible();
		} );
		expect( screen.queryByTestId( 'list-sites' ) ).not.toBeInTheDocument();
	} );

	test( 'renders ListSites in the sites view', async () => {
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.2/read/lists/test_user/my-list' )
			.reply( 200, { list: listData } );

		renderWithProvider(
			<ReaderList owner="test_user" slug="my-list" view="sites" streamKey="list:1" />,
			{ reducers, initialState: readerListsState(), queryClient: createQueryClient() }
		);

		await waitFor( () => {
			expect( screen.getByTestId( 'list-sites' ) ).toBeVisible();
		} );
		expect( screen.queryByTestId( 'stream' ) ).not.toBeInTheDocument();
	} );
} );
