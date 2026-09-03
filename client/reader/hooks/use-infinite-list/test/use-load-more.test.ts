/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { useLoadMore } from '../use-load-more';

function setup( overrides: Partial< Parameters< typeof useLoadMore >[ 0 ] > = {} ) {
	const loadMore = jest.fn();
	const props = {
		lastIndex: 9,
		count: 10,
		hasMore: true,
		isLoadingMore: false,
		loadMore,
		...overrides,
	};
	const view = renderHook( ( p: Parameters< typeof useLoadMore >[ 0 ] ) => useLoadMore( p ), {
		initialProps: props,
	} );
	return { loadMore, view, props };
}

describe( 'useLoadMore', () => {
	it( 'loads more when the last rendered item reaches the end and more remain', () => {
		const { loadMore } = setup( { lastIndex: 9, count: 10 } );

		expect( loadMore ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'does not load when the last rendered item is before the end', () => {
		const { loadMore } = setup( { lastIndex: 4, count: 10 } );

		expect( loadMore ).not.toHaveBeenCalled();
	} );

	it( 'does not load when there are no more pages', () => {
		const { loadMore } = setup( { hasMore: false } );

		expect( loadMore ).not.toHaveBeenCalled();
	} );

	it( 'does not load while a page is already loading', () => {
		const { loadMore } = setup( { isLoadingMore: true } );

		expect( loadMore ).not.toHaveBeenCalled();
	} );

	it( 'does not load before anything has rendered', () => {
		const { loadMore } = setup( { lastIndex: undefined } );

		expect( loadMore ).not.toHaveBeenCalled();
	} );

	it( 'does not re-load on re-render with the same end reached', () => {
		const { loadMore, view, props } = setup( { lastIndex: 9, count: 10 } );
		expect( loadMore ).toHaveBeenCalledTimes( 1 );

		view.rerender( { ...props } );

		expect( loadMore ).toHaveBeenCalledTimes( 1 );
	} );
} );
