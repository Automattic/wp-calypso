/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react';
import useResourceLoadMore from '../use-resource-load-more';

function Library( { query = 'all', total = 64, paused = false } ) {
	const { visibleCount, hasMore, loadMore, sentinelRef } = useResourceLoadMore(
		total,
		query,
		paused
	);
	return (
		<div>
			<output>{ visibleCount }</output>
			<div ref={ sentinelRef } />
			{ hasMore && <button onClick={ loadMore }>Load more</button> }
		</div>
	);
}

const originalObserver = window.IntersectionObserver;
afterEach( () => {
	window.IntersectionObserver = originalObserver;
} );

test( 'manual fallback reaches the end and resets after changing filters', async () => {
	Reflect.deleteProperty( window, 'IntersectionObserver' );
	const { rerender } = render( <Library /> );
	expect( screen.getByRole( 'status' ) ).toHaveTextContent( '24' );
	await userEvent.click( screen.getByRole( 'button' ) );
	expect( screen.getByRole( 'status' ) ).toHaveTextContent( '48' );
	await userEvent.click( screen.getByRole( 'button' ) );
	expect( screen.getByRole( 'status' ) ).toHaveTextContent( '64' );
	expect( screen.queryByRole( 'button' ) ).toBeNull();
	rerender( <Library query="learn" total={ 10 } /> );
	expect( screen.getByRole( 'status' ) ).toHaveTextContent( '10' );
	rerender( <Library /> );
	expect( screen.getByRole( 'status' ) ).toHaveTextContent( '24' );
} );

test( 'automatic loading ignores stale callbacks and pauses while the preview is open', async () => {
	const callbacks: IntersectionObserverCallback[] = [];
	const disconnect = jest.fn();
	window.IntersectionObserver = jest.fn( ( callback ) => {
		callbacks.push( callback );
		return { observe: jest.fn(), disconnect };
	} ) as unknown as typeof IntersectionObserver;
	const intersect = ( index: number ) => {
		act( () =>
			callbacks[ index ](
				[ { isIntersecting: true } as IntersectionObserverEntry ],
				{} as IntersectionObserver
			)
		);
	};
	const { rerender } = render( <Library /> );
	intersect( 0 );
	expect( screen.getByRole( 'status' ) ).toHaveTextContent( '48' );
	intersect( 0 );
	expect( screen.getByRole( 'status' ) ).toHaveTextContent( '48' );
	rerender( <Library paused /> );
	intersect( 1 );
	expect( screen.getByRole( 'status' ) ).toHaveTextContent( '48' );
	rerender( <Library /> );
	screen.getByRole( 'button' ).focus();
	intersect( 2 );
	expect( screen.getByRole( 'status' ) ).toHaveTextContent( '48' );
	await userEvent.click( screen.getByRole( 'button' ) );
	expect( screen.getByRole( 'status' ) ).toHaveTextContent( '64' );
	expect( disconnect ).toHaveBeenCalled();
} );
