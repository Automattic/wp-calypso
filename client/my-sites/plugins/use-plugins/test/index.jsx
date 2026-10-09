/** @jest-environment jsdom */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import wpcom from 'calypso/lib/wp';
import usePlugins from '../';

jest.mock( 'calypso/lib/wp', () => ( { req: { get: jest.fn() } } ) );
jest.mock( 'calypso/state', () => ( { useSelector: () => 'en' } ) );
jest.mock( 'i18n-calypso', () => ( {
	...jest.requireActual( 'i18n-calypso' ),
	useTranslate: () => ( { localeSlug: 'en' } ),
} ) );
jest.mock( '../../categories/use-categories', () => ( {
	useCategories: () => ( {} ),
	getCategories: () => ( {} ),
} ) );

const plugins = Array.from( { length: 45 }, ( _, n ) => ( {
	slug: `plugin-${ n }`,
	name: `Plugin ${ n }`,
} ) );

function setup() {
	const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
	return {
		queryClient,
		wrapper: ( { children } ) => (
			<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
		),
	};
}

beforeEach( () => wpcom.req.get.mockReset() );

test.each( [ 'paid', 'featured' ] )(
	'slices the complete %s list locally and reuses it across pages',
	async ( category ) => {
		const { queryClient, wrapper } = setup();
		wpcom.req.get.mockResolvedValue( category === 'paid' ? { results: plugins } : plugins );
		const { result, rerender } = renderHook( ( page ) => usePlugins( { category, page } ), {
			wrapper,
			initialProps: 1,
		} );
		await waitFor( () => expect( result.current.plugins ).toHaveLength( 20 ) );
		expect( result.current.plugins[ 0 ].slug ).toBe( 'plugin-0' );
		rerender( 2 );
		expect( result.current.plugins[ 0 ].slug ).toBe( 'plugin-20' );
		expect( result.current.pagination ).toEqual( { page: 2, pages: 3, results: 45 } );
		rerender( 3 );
		expect( result.current.plugins ).toHaveLength( 5 );
		rerender( 4 );
		expect( result.current.plugins ).toHaveLength( 0 );
		expect( wpcom.req.get ).toHaveBeenCalledTimes( 1 );
		expect( wpcom.req.get.mock.calls[ 0 ][ 0 ].path ).toBe(
			category === 'paid' ? '/marketplace/products' : '/plugins/featured'
		);
		queryClient.clear();
	}
);

test.each( [ 'paid', 'featured' ] )(
	'exposes %s loading and failed requests with a retry',
	async ( category ) => {
		const { queryClient, wrapper } = setup();
		wpcom.req.get
			.mockRejectedValueOnce( new Error( 'unavailable' ) )
			.mockResolvedValueOnce( category === 'paid' ? { results: plugins } : plugins );
		const { result } = renderHook( () => usePlugins( { category, page: 1 } ), { wrapper } );
		expect( result.current.isFetching ).toBe( true );
		await waitFor( () => expect( result.current.isError ).toBe( true ) );
		await act( () => result.current.retry() );
		await waitFor( () => expect( result.current.plugins ).toHaveLength( 20 ) );
		queryClient.clear();
	}
);

test( 'keeps discovery callers on their existing complete list', async () => {
	const { queryClient, wrapper } = setup();
	wpcom.req.get.mockResolvedValue( { results: plugins } );
	const { result } = renderHook( () => usePlugins( { category: 'paid' } ), { wrapper } );
	await waitFor( () => expect( result.current.plugins ).toHaveLength( 45 ) );
	expect( result.current.pagination.results ).toBe( 45 );
	queryClient.clear();
} );
