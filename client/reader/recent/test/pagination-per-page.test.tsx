/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { upsertPostCache } from 'calypso/reader/data/post/cache';
import { usePaginatedStream, type StreamListItem } from 'calypso/reader/data/stream';
import Recent from 'calypso/reader/recent';
import type { ReactNode, Ref } from 'react';

// Change the per-page size to this value in the tests. It differs from the
// initial 15 so `handleChangeView` treats it as a per-page change.
const TARGET_PER_PAGE = 30;

let mockIsWide = false;

jest.mock( '@automattic/viewport-react', () => ( {
	useBreakpoint: () => mockIsWide,
} ) );

// Minimal DataViews stand-in that surfaces the current `view` and lets the test
// drive `onChangeView` / `onChangeSelection` directly, mirroring how the real
// per-page control and row selection call back into `Recent`.
jest.mock( '@wordpress/dataviews', () => {
	const React = jest.requireActual( 'react' );
	return {
		DataViews: ( {
			view,
			data,
			fields,
			isLoading,
			selection,
			getItemId,
			onChangeView,
			onChangeSelection,
		}: {
			view: { page?: number; perPage?: number };
			data: StreamListItem[];
			fields: Array< { id: string; render: ( args: { item: StreamListItem } ) => ReactNode } >;
			isLoading: boolean;
			selection: string[];
			getItemId: ( item: StreamListItem, index?: number ) => string;
			onChangeView: ( view: Record< string, unknown > ) => void;
			onChangeSelection: ( selection: string[] ) => void;
		} ) => {
			// Optimistically emulate DataViews' keep-previous-data: while a refetch
			// is in flight with no fresh rows, keep the previously shown rows mounted
			// (dimmed via `is-refreshing`). Real DataViews also snapshots an empty
			// `shownData` on a settled commit, so this row retention is NOT guaranteed
			// in production — the mock keeps rows here so the content-fallback path
			// (`getPostFromItem` -> `previousPostsRef`) can be exercised in isolation.
			const previousDataRef = React.useRef( data );
			if ( ! isLoading && data.length > 0 ) {
				previousDataRef.current = data;
			}
			const rows: StreamListItem[] =
				isLoading && data.length === 0 ? previousDataRef.current : data;
			const postField = fields.find( ( field ) => field.id === 'post' );
			return (
				<div>
					<div
						data-testid="view-state"
						data-page={ String( view.page ) }
						data-per-page={ String( view.perPage ) }
						data-selection={ ( selection ?? [] ).join( ',' ) }
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
					<button
						data-testid="select-off-page"
						onClick={ () => onChangeSelection( [ 'f200-320' ] ) }
					>
						select off page
					</button>
					{ rows.map( ( item, index ) => (
						<div key={ getItemId( item, index ) }>
							<button
								data-testid={ `select-${ index }` }
								onClick={ () => onChangeSelection( [ getItemId( item, index ) ] ) }
							>
								select { index }
							</button>
							{ postField?.render( { item } ) }
						</div>
					) ) }
				</div>
			);
		},
		filterSortAndPaginate: (
			data: StreamListItem[],
			view: { page?: number; perPage?: number }
		) => {
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
	};
} );

// Render just the post title so the list's row content is observable without
// pulling in the real featured-image/block dependencies.
jest.mock( 'calypso/reader/recent/recent-post-field', () => {
	const { forwardRef } = jest.requireActual( 'react' );
	return {
		__esModule: true,
		default: forwardRef( ( { post }: { post?: { title?: string } }, ref: Ref< HTMLDivElement > ) =>
			post ? <div ref={ ref }>{ post.title }</div> : null
		),
	};
} );

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

jest.mock( 'calypso/reader/recent/recent-post-skeleton', () => () => (
	<div data-testid="recent-post-skeleton" />
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

const buildStreamItems = ( count: number = TOTAL_ITEMS ): StreamListItem[] =>
	Array.from( { length: count }, ( _, index ) => ( {
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
	const result = render(
		<QueryClientProvider client={ queryClient }>
			<Provider store={ store }>
				<Recent />
			</Provider>
		</QueryClientProvider>
	);
	return { ...result, queryClient };
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
		mockIsWide = false;
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

	it( 'keeps the selected full post visible during the per-page refetch', async () => {
		const user = userEvent.setup();
		const { queryClient } = renderRecent();

		// Seed the canonical post cache for the post we will select (feedId 200,
		// postId 300 -> the first stream item).
		upsertPostCache( queryClient, [
			{
				ID: 1,
				site_ID: 100,
				feed_ID: 200,
				feed_item_ID: 300,
				global_ID: 'global-300',
				title: 'Selected post',
			},
		] );

		await user.click( screen.getByTestId( 'select-0' ) );
		expect( screen.getByTestId( 'async-load' ) ).toBeVisible();

		// Simulate the new page size still fetching: the paginated stream list is
		// momentarily empty while `isRequesting` is true.
		( usePaginatedStream as jest.Mock ).mockReturnValue( {
			items: [],
			pagination: { totalItems: 0, totalPages: 0 },
			isRequesting: true,
			error: null,
		} );

		await user.click( screen.getByTestId( 'change-per-page' ) );

		// The full post stays mounted (fed from the canonical cache) and the
		// loading skeleton does not flash back in.
		expect( screen.getByTestId( 'async-load' ) ).toBeVisible();
		expect( screen.queryByTestId( 'recent-post-skeleton' ) ).not.toBeInTheDocument();
	} );

	it( 'preserves row content via the previous-posts fallback when rows are kept during a per-page refetch', async () => {
		const user = userEvent.setup();
		const { queryClient } = renderRecent();

		// Scope: this verifies the content-fallback that `Recent` owns
		// (`getPostFromItem` -> `previousPostsRef`), given the rows stay mounted.
		// Whether DataViews actually keeps the rows mounted during the refetch is
		// its own keep-previous behavior and is not guaranteed in production; the
		// mock retains the rows so the fallback path can be asserted in isolation.

		// Seed the canonical cache for the first two stream items so their rows
		// render titles.
		upsertPostCache( queryClient, [
			{
				ID: 1,
				site_ID: 100,
				feed_ID: 200,
				feed_item_ID: 300,
				global_ID: 'global-300',
				title: 'Post A',
			},
			{
				ID: 2,
				site_ID: 100,
				feed_ID: 200,
				feed_item_ID: 301,
				global_ID: 'global-301',
				title: 'Post B',
			},
		] );

		expect( await screen.findByText( 'Post A' ) ).toBeVisible();
		expect( screen.getByText( 'Post B' ) ).toBeVisible();

		// Simulate the new page size still fetching: the paginated stream list is
		// momentarily empty while `isRequesting` is true.
		( usePaginatedStream as jest.Mock ).mockReturnValue( {
			items: [],
			pagination: { totalItems: 0, totalPages: 0 },
			isRequesting: true,
			error: null,
		} );

		await user.click( screen.getByTestId( 'change-per-page' ) );

		// The retained rows keep their content (resolved from the last non-empty
		// posts map) instead of rendering as blank rows while loading.
		expect( screen.getByText( 'Post A' ) ).toBeVisible();
		expect( screen.getByText( 'Post B' ) ).toBeVisible();
	} );

	describe( 'wide viewport auto-selection', () => {
		beforeEach( () => {
			mockIsWide = true;
		} );

		it( 'auto-selects the first post on the page when the page changes', async () => {
			const user = userEvent.setup();
			renderRecent();

			// Mount auto-selects the first item of page 1.
			expect( screen.getByTestId( 'view-state' ) ).toHaveAttribute( 'data-selection', 'f200-300' );

			// Navigating pages selects the first item of the new page.
			await user.click( screen.getByTestId( 'go-to-page-3' ) );
			expect( screen.getByTestId( 'view-state' ) ).toHaveAttribute( 'data-selection', 'f200-330' );
		} );

		it( 'does not revert an off-page selection when only the selection changes', async () => {
			const user = userEvent.setup();
			renderRecent();

			// Select a post that lives on a later page (absolute index 20, page 2 at
			// perPage 15) — as full-post keyboard navigation can. The page auto-select
			// effect must not snap the selection back to the first post of page 1.
			await user.click( screen.getByTestId( 'select-off-page' ) );

			expect( screen.getByTestId( 'view-state' ) ).toHaveAttribute( 'data-selection', 'f200-320' );
		} );

		it( 'shows the loading state while navigating to an uncached page, then selects its first post', async () => {
			const user = userEvent.setup();
			const { queryClient } = renderRecent();

			// Seed page 1's first post so the full post is visible before navigating.
			upsertPostCache( queryClient, [
				{
					ID: 1,
					site_ID: 100,
					feed_ID: 200,
					feed_item_ID: 300,
					global_ID: 'global-300',
					title: 'Post A',
				},
			] );
			expect( screen.getByTestId( 'view-state' ) ).toHaveAttribute( 'data-selection', 'f200-300' );
			expect( await screen.findByTestId( 'async-load' ) ).toBeVisible();

			// Navigate to page 3 while only page-1 data is loaded (its rows aren't
			// present yet). The selection clears so the full-post pane shows loading.
			( usePaginatedStream as jest.Mock ).mockReturnValue( {
				items: buildStreamItems( 15 ),
				pagination: { totalItems: TOTAL_ITEMS, totalPages: 3 },
				isRequesting: true,
				error: null,
			} );
			await user.click( screen.getByTestId( 'go-to-page-3' ) );

			expect( screen.getByTestId( 'view-state' ) ).toHaveAttribute( 'data-selection', '' );
			expect( screen.getByTestId( 'recent-post-skeleton' ) ).toBeVisible();
			expect( screen.queryByTestId( 'async-load' ) ).not.toBeInTheDocument();

			// Once the page settles, its first item is selected.
			( usePaginatedStream as jest.Mock ).mockReturnValue( {
				items: buildStreamItems( 45 ),
				pagination: { totalItems: TOTAL_ITEMS, totalPages: 3 },
				isRequesting: false,
				error: null,
			} );
			await user.click( screen.getByTestId( 'go-to-page-3' ) );

			expect( screen.getByTestId( 'view-state' ) ).toHaveAttribute( 'data-selection', 'f200-330' );
		} );

		it( 'keeps the selection on a per-page change even when it lands outside the computed page range', async () => {
			const user = userEvent.setup();
			renderRecent();

			// Select a post at absolute index 20 (f200-320). Under the new per-page
			// size of 30 that anchors to page 1, whose range is [0, 30).
			await user.click( screen.getByTestId( 'select-off-page' ) );
			expect( screen.getByTestId( 'view-state' ) ).toHaveAttribute( 'data-selection', 'f200-320' );

			// The refetch is in flight: no rows yet.
			( usePaginatedStream as jest.Mock ).mockReturnValue( {
				items: [],
				pagination: { totalItems: 0, totalPages: 0 },
				isRequesting: true,
				error: null,
			} );
			await user.click( screen.getByTestId( 'change-per-page' ) );
			expect( screen.getByTestId( 'view-state' ) ).toHaveAttribute( 'data-selection', 'f200-320' );

			// The new page settles, but x-post collapsing shifted the selected post
			// to index 35 — outside page 1's [0, 30) range. The range check alone
			// would swap the selection to the page's first item (f200-300); the
			// per-page intent flag must keep the original selection instead.
			const settled = buildStreamItems( 45 );
			[ settled[ 20 ], settled[ 35 ] ] = [ settled[ 35 ], settled[ 20 ] ];
			( usePaginatedStream as jest.Mock ).mockReturnValue( {
				items: settled,
				pagination: { totalItems: TOTAL_ITEMS, totalPages: 2 },
				isRequesting: false,
				error: null,
			} );
			await user.click( screen.getByTestId( 'change-per-page' ) );

			expect( screen.getByTestId( 'view-state' ) ).toHaveAttribute( 'data-selection', 'f200-320' );
		} );
	} );
} );
