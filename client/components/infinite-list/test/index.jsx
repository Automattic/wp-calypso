/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import InfiniteList from '../index';

const items = [ { id: 1 }, { id: 2 }, { id: 3 } ];
const getItemRef = ( item ) => `item-${ item.id }`;
const noop = () => {};

function renderList( renderItem, listRef ) {
	return render(
		<InfiniteList
			ref={ listRef }
			items={ items }
			lastPage
			fetchNextPage={ noop }
			fetchingNextPage={ false }
			guessedItemHeight={ 100 }
			getItemRef={ getItemRef }
			renderItem={ renderItem }
			renderLoadingPlaceholders={ () => null }
		/>
	);
}

describe( 'InfiniteList', () => {
	let clientHeightSpy;

	beforeEach( () => {
		// jsdom reports clientHeight as 0, which would leave the list with no
		// visible rows. Give the scroll context a height so items render.
		clientHeightSpy = jest
			.spyOn( document.documentElement, 'clientHeight', 'get' )
			.mockReturnValue( 1000 );
		// jsdom doesn't implement window.scrollTo; the list calls it on mount.
		window.scrollTo = jest.fn();
	} );

	afterEach( () => {
		clientHeightSpy.mockRestore();
	} );

	it( 'passes a registerItemRef callback as the third renderItem argument', () => {
		// Regression guard: the third argument is the contract that lets consumers
		// register their item's DOM node. Consumers whose renderItem has a colliding
		// third positional param would silently misbehave (see blogs-settings).
		const renderItem = jest.fn( ( item, index, registerItemRef ) => (
			<div key={ getItemRef( item ) } ref={ registerItemRef } data-testid={ getItemRef( item ) } />
		) );
		renderList( renderItem );

		expect( renderItem ).toHaveBeenCalled();
		renderItem.mock.calls.forEach( ( [ , , registerItemRef ] ) => {
			expect( typeof registerItemRef ).toBe( 'function' );
		} );
	} );

	it( 'registers each rendered item node so boundsForRef can measure it', () => {
		const listRef = createRef();
		const renderItem = ( item, index, registerItemRef ) => (
			<div key={ getItemRef( item ) } ref={ registerItemRef } data-testid={ getItemRef( item ) } />
		);
		renderList( renderItem, listRef );

		const node = screen.getByTestId( 'item-1' );
		jest.spyOn( node, 'getBoundingClientRect' ).mockReturnValue( { top: 10, bottom: 52 } );

		expect( listRef.current.boundsForRef( 'item-1' ) ).toEqual( { top: 10, bottom: 52 } );
		expect( listRef.current.getDOMNode() ).toBe( node.parentElement );
	} );

	it( 'returns a stable callback ref per key across renders', () => {
		// An unstable ref would re-run on every render and, forwarded as a prop,
		// would defeat consumers' own-props memoization.
		const listRef = createRef();
		renderList( () => null, listRef );

		const first = listRef.current.setItemRef( 'item-1' );
		const second = listRef.current.setItemRef( 'item-1' );
		expect( first ).toBe( second );
		expect( listRef.current.setItemRef( 'item-2' ) ).not.toBe( first );
	} );

	it( 'drops item nodes from the ref map on unmount', () => {
		const listRef = createRef();
		const renderItem = ( item, index, registerItemRef ) => (
			<div key={ getItemRef( item ) } ref={ registerItemRef } data-testid={ getItemRef( item ) } />
		);
		const { unmount } = renderList( renderItem, listRef );

		const instance = listRef.current;
		expect( instance.itemRefs.has( 'item-1' ) ).toBe( true );

		unmount();
		expect( instance.itemRefs.size ).toBe( 0 );
	} );
} );
