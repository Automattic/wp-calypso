/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { usePaginatedStream, type StreamListItem } from 'calypso/reader/data/stream';
import Recent from 'calypso/reader/recent';
import type { ReactNode } from 'react';

// Change the per-page size to this value in the tests. It differs from the
// initial 15 so `handleChangeView` treats it as a per-page change.
const TARGET_PER_PAGE = 30;

jest.mock( '@automattic/viewport-react', () => ( {
	useBreakpoint: () => false,
} ) );

// Minimal DataViews stand-in that surfaces the current `view` and lets the test
// drive `onChangeView` / `onChangeSelection` directly, mirroring how the real
// per-page control and row selection call back into `Recent`.
jest.mock( '@wordpress/dataviews', () => ( {
	DataViews: ( {
		view,
		data,
		getItemId,
		onChangeView,
		onChangeSelection,
	}: {
		view: { page?: number; perPage?: number };
		data: StreamListItem[];
		getItemId: ( item: StreamListItem, index?: number ) => string;
		onChangeView: ( view: Record< string, unknown > ) => void;
		onChangeSelection: ( selection: string[] ) => void;
	} ) => (
		<div>
			<div
				data-testid="view-state"
				data-page={ String( view.page ) }
				data-per-page={ String( view.perPage ) }
			/>
			<button data-testid="go-to-page-3" onClick={ () => onChangeView( { ...view, page: 3 } ) }>
				page 3
			</button>
			<button
				data-testid="change-per-page"
				onClick={ () => onChangeView( { ...view, perPage: TARGET_PER_PAGE, page: 1 } ) }
			>
				change per page
			</button>
			{ data.map( ( item, index ) => (
				<button
					key={ getItemId( item, index ) }
					data-testid={ `select-${ index }` }
					onClick={ () => onChangeSelection( [ getItemId( item, index ) ] ) }
				>
					select { index }
				</button>
			) ) }
		</div>
	),
	filterSortAndPaginate: ( data: StreamListItem[], view: { page?: number; perPage?: number } ) => {
		const page = view.page ?? 1;
		const perPage = view.perPage ?? data.length;
		const start = ( page - 1 ) * perPage;
		return {
			data: data.slice( start, start + perPage ),
			paginationInfo: {
				totalItems: data.length,
				totalPages: Math.ceil( data.length / perPage ) || 1,
			},
		};
	},
} ) );

jest.mock( 'calypso/components/async-load', () => () => <div data-testid="async-load" /> );

jest.mock( 'calypso/components/navigation-header', () => ( {
	__esModule: true,
	default: ( { title, children }: { title: string; children?: ReactNode } ) => (
		<header>
			<h1>{ title }</h1>
			{ children }
		</header>
	),
} ) );

jest.mock( 'calypso/reader/stream/empty', () => () => <div data-testid="empty-stream" /> );

jest.mock( 'calypso/reader/recent/engagement-bar', () => () => (
	<div data-testid="engagement-bar" />
) );

jest.mock( 'calypso/reader/data/site-subscriptions', () => ( {
	useSiteSubscriptions: () => ( { subscriptions: [] } ),
} ) );

jest.mock( 'calypso/state/reader-ui/actions', () => ( {
	viewStream: ( streamKey: string, path: string ) => ( {
		type: 'TEST_VIEW_STREAM',
		streamKey,
		path,
	} ),
} ) );

// Require `isPaddingStreamItem` from the leaf `types` module rather than the
// barrel to avoid a circular-import evaluation error when the mock factory runs.
jest.mock( 'calypso/reader/data/stream', () => {
	const { isPaddingStreamItem } = jest.requireActual( 'calypso/reader/data/stream/types' );
	return {
		__esModule: true,
		isPaddingStreamItem,
		usePaginatedStream: jest.fn(),
	};
} );

const TOTAL_ITEMS = 45;

const buildStreamItems = (): StreamListItem[] =>
	Array.from( { length: TOTAL_ITEMS }, ( _, index ) => ( {
		feedId: 200,
		postId: 300 + index,
		site_name: `Site ${ index }`,
	} ) ) as StreamListItem[];

const renderRecent = () => {
	const queryClient = new QueryClient( {
		defaultOptions: { queries: { refetchOnMount: false, retry: false } },
	} );
	const store = createStore(
		( state = { reader: {}, readerUi: { sidebar: { selectedRecentSite: null } } } ) => state
	);
	return render(
		<QueryClientProvider client={ queryClient }>
			<Provider store={ store }>
				<Recent />
			</Provider>
		</QueryClientProvider>
	);
};

describe( 'Recent per-page pagination', () => {
	beforeEach( () => {
		( usePaginatedStream as jest.Mock ).mockReturnValue( {
			items: buildStreamItems(),
			pagination: { totalItems: TOTAL_ITEMS, totalPages: 3 },
			isRequesting: false,
			error: null,
		} );
	} );

	afterEach( () => {
		jest.clearAllMocks();
	} );

	it( 'recomputes the page from the selected post when the per-page size changes', async () => {
		const user = userEvent.setup();
		renderRecent();

		// Navigate to page 3 (items at absolute indices 30-44 with perPage 15).
		await user.click( screen.getByTestId( 'go-to-page-3' ) );
		expect( screen.getByTestId( 'view-state' ) ).toHaveAttribute( 'data-page', '3' );

		// Select the first post on page 3 (absolute index 30).
		await user.click( screen.getByTestId( 'select-0' ) );

		// Change per-page to 30. The selected post (index 30) now lands on page 2.
		await user.click( screen.getByTestId( 'change-per-page' ) );

		const viewState = screen.getByTestId( 'view-state' );
		expect( viewState ).toHaveAttribute( 'data-per-page', String( TARGET_PER_PAGE ) );
		expect( viewState ).toHaveAttribute( 'data-page', '2' );
	} );

	it( 'keeps the current page position when no post is selected', async () => {
		const user = userEvent.setup();
		renderRecent();

		await user.click( screen.getByTestId( 'go-to-page-3' ) );

		// Change per-page to 30 without a selection. The top of page 3 (index 30)
		// falls on page 2 under the new size, so we should not snap back to page 1.
		await user.click( screen.getByTestId( 'change-per-page' ) );

		const viewState = screen.getByTestId( 'view-state' );
		expect( viewState ).toHaveAttribute( 'data-per-page', String( TARGET_PER_PAGE ) );
		expect( viewState ).toHaveAttribute( 'data-page', '2' );
	} );
} );
