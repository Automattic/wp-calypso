/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { OnThisDay } from 'calypso/reader/on-this-day';
import Recent from 'calypso/reader/recent';
import type { ReactNode } from 'react';

type DataViewField = {
	id: string;
	render: ( props: { item: Record< string, unknown > } ) => ReactNode;
};

jest.mock( '@automattic/viewport-react', () => ( {
	useBreakpoint: () => false,
} ) );

jest.mock( '@wordpress/dataviews', () => ( {
	DataViews: ( {
		data,
		fields,
	}: {
		data: Array< Record< string, unknown > >;
		fields: DataViewField[];
	} ) => (
		<div>
			{ data.map( ( item, index ) => (
				<div key={ String( item.postId ?? index ) }>
					{ fields.map( ( field ) => (
						<div key={ field.id }>{ field.render( { item } ) }</div>
					) ) }
				</div>
			) ) }
		</div>
	),
	filterSortAndPaginate: ( data: Array< Record< string, unknown > > ) => ( {
		data,
		paginationInfo: { totalItems: data.length, totalPages: 1 },
	} ),
} ) );

jest.mock( 'calypso/blocks/reader-featured-image', () => () => (
	<div data-testid="reader-featured-image" />
) );

jest.mock( 'calypso/blocks/site-icon', () => ( {
	SiteIcon: () => <div data-testid="site-icon" />,
} ) );

jest.mock( 'calypso/components/async-load', () => () => <div data-testid="async-load" /> );

jest.mock(
	'calypso/reader/recent/engagement-bar',
	() =>
		( { commentsApiDisabled }: { commentsApiDisabled?: boolean } ) => (
			<div
				data-testid="engagement-bar"
				data-comments-api-disabled={ String( commentsApiDisabled ) }
			/>
		)
);

jest.mock( 'calypso/components/navigation-header', () => ( {
	__esModule: true,
	default: ( {
		title,
		subtitle,
		children,
	}: {
		title: string;
		subtitle?: string;
		children?: ReactNode;
	} ) => (
		<header>
			<h1>{ title }</h1>
			{ subtitle && <span>{ subtitle }</span> }
			{ children }
		</header>
	),
} ) );

jest.mock( 'calypso/reader/stream/empty', () => () => <div data-testid="empty-stream" /> );

jest.mock( 'calypso/state/reader/follows/selectors', () => ( {
	getReaderFollowForFeed: () => null,
} ) );

jest.mock( 'calypso/state/reader-ui/actions', () => ( {
	viewStream: ( streamKey: string, path: string ) => ( {
		type: 'TEST_VIEW_STREAM',
		streamKey,
		path,
	} ),
} ) );

jest.mock( 'calypso/state/selectors/get-current-query-arguments', () => {
	const emptyQueryArgs = {};
	return {
		__esModule: true,
		default: () => emptyQueryArgs,
	};
} );

const makeWrapper = ( queryClient: QueryClient, state: Record< string, unknown > ) => {
	const store = createStore( ( currentState = state ) => currentState );
	return ( { children }: { children: ReactNode } ) => (
		<QueryClientProvider client={ queryClient }>
			<Provider store={ store }>{ children }</Provider>
		</QueryClientProvider>
	);
};

describe( 'Reader post cache surfaces', () => {
	it( 'renders Recent list rows from the canonical post cache', async () => {
		const queryClient = new QueryClient( {
			defaultOptions: { queries: { refetchOnMount: false, retry: false } },
		} );
		queryClient.setQueryData(
			[ 'read', 'stream', 'recent', { page: 1, perPage: 15, localeSlug: null } ],
			{
				posts: [
					{
						ID: 1,
						site_ID: 100,
						feed_ID: 200,
						feed_item_ID: 300,
						global_ID: 'global-1',
						title: 'Cached recent title',
						site_name: 'Stream site',
					},
				],
				found: 1,
				total_pages: 1,
			}
		);
		render( <Recent />, {
			wrapper: makeWrapper( queryClient, {
				reader: {},
				readerUi: { sidebar: { selectedRecentSite: null } },
			} ),
		} );

		expect( await screen.findByText( 'Cached recent title' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Stream site' ) ).toBeInTheDocument();
	} );

	it( 'opens the selected post in the Recent detail pane for a feed-filtered stream', async () => {
		const queryClient = new QueryClient( {
			defaultOptions: { queries: { refetchOnMount: false, retry: false } },
		} );
		queryClient.setQueryData(
			[ 'read', 'stream', 'recent:112530312', { page: 1, perPage: 15, localeSlug: null } ],
			{
				posts: [
					{
						ID: 1,
						site_ID: 100,
						feed_ID: 112530312,
						feed_item_ID: 300,
						global_ID: 'global-1',
						title: 'Filtered recent title',
						site_name: 'Filtered stream site',
					},
				],
				found: 1,
				total_pages: 1,
			}
		);

		render( <Recent />, {
			wrapper: makeWrapper( queryClient, {
				reader: {},
				readerUi: { sidebar: { selectedRecentSite: 112530312 } },
			} ),
		} );

		fireEvent.click( await screen.findByText( 'Filtered recent title' ) );

		expect( screen.getByTestId( 'async-load' ) ).toBeInTheDocument();
	} );

	it( 'passes the cached comments API disabled state to Recent engagement actions', async () => {
		const queryClient = new QueryClient( {
			defaultOptions: { queries: { refetchOnMount: false, retry: false } },
		} );
		queryClient.setQueryData(
			[ 'read', 'stream', 'recent', { page: 1, perPage: 15, localeSlug: null } ],
			{
				posts: [
					{
						ID: 1,
						site_ID: 100,
						feed_ID: 200,
						feed_item_ID: 300,
						global_ID: 'global-1',
						title: 'Cached disabled comments title',
						site_name: 'Stream site',
					},
				],
				found: 1,
				total_pages: 1,
			}
		);
		queryClient.setQueryData( [ 'site', 'comments', 'api-disabled', 100 ], true );

		render( <Recent />, {
			wrapper: makeWrapper( queryClient, {
				reader: {},
				readerUi: { sidebar: { selectedRecentSite: null } },
			} ),
		} );

		fireEvent.click( await screen.findByText( 'Cached disabled comments title' ) );

		expect( screen.getByTestId( 'engagement-bar' ) ).toHaveAttribute(
			'data-comments-api-disabled',
			'true'
		);
	} );

	it( 'renders On This Day list rows from the canonical post cache', async () => {
		const queryClient = new QueryClient( {
			defaultOptions: { queries: { refetchOnMount: false, retry: false } },
		} );
		queryClient.setQueryData(
			[ 'read', 'stream', 'on_this_day', { page: 1, perPage: 15, localeSlug: null } ],
			{
				posts: [
					{
						ID: 2,
						site_ID: 101,
						global_ID: 'global-2',
						title: 'Cached on this day title',
						site_name: 'Stream archive site',
						date: '2020-05-20T00:00:00Z',
					},
				],
				found: 1,
				total_pages: 1,
			}
		);
		render( <OnThisDay streamKey="on_this_day" />, {
			wrapper: makeWrapper( queryClient, {
				reader: {},
				readerUi: { sidebar: { selectedRecentSite: null } },
			} ),
		} );

		expect( await screen.findByText( 'Cached on this day title' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Stream archive site' ) ).toBeInTheDocument();
		expect( screen.getByText( '2020' ) ).toBeInTheDocument();
	} );
} );
