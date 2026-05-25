/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { upsertPostCache } from 'calypso/reader/data/post-cache';
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

jest.mock( 'calypso/state/reader/streams/actions', () => ( {
	requestPaginatedStream: ( payload: Record< string, unknown > ) => ( {
		type: 'TEST_REQUEST_PAGINATED_STREAM',
		payload,
	} ),
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
	it( 'renders Recent list rows from the canonical post cache', () => {
		const queryClient = new QueryClient();
		upsertPostCache( queryClient, [
			{
				ID: 1,
				site_ID: 100,
				feed_ID: 200,
				feed_item_ID: 300,
				global_ID: 'global-1',
				title: 'Cached recent title',
				site_name: 'Cached site',
			},
		] );

		render( <Recent />, {
			wrapper: makeWrapper( queryClient, {
				reader: {
					streams: {
						recent: {
							items: [ { feedId: 200, postId: 300, site_name: 'Stream site' } ],
							pagination: { totalItems: 1, totalPages: 1 },
							isRequesting: false,
						},
					},
				},
				readerUi: { sidebar: { selectedRecentSite: null } },
			} ),
		} );

		expect( screen.getByText( 'Cached recent title' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Cached site' ) ).toBeInTheDocument();
	} );

	it( 'renders On This Day list rows from the canonical post cache', () => {
		const queryClient = new QueryClient();
		upsertPostCache( queryClient, [
			{
				ID: 2,
				site_ID: 101,
				global_ID: 'global-2',
				title: 'Cached on this day title',
				site_name: 'Archive site',
				date: '2020-05-20T00:00:00Z',
			},
		] );

		render( <OnThisDay streamKey="on-this-day" />, {
			wrapper: makeWrapper( queryClient, {
				reader: {
					streams: {
						'on-this-day': {
							items: [ { blogId: 101, postId: 2, site_name: 'Stream archive site' } ],
							pagination: { totalItems: 1, totalPages: 1 },
							isRequesting: false,
						},
					},
				},
				readerUi: { sidebar: { selectedRecentSite: null } },
			} ),
		} );

		expect( screen.getByText( 'Cached on this day title' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Archive site' ) ).toBeInTheDocument();
		expect( screen.getByText( '2020' ) ).toBeInTheDocument();
	} );
} );
