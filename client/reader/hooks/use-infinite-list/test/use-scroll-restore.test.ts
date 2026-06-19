/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { useScrollRestore, readScrollSnapshot } from '../use-scroll-restore';
import type { Virtualizer, VirtualItem } from '@tanstack/react-virtual';

function fakeVirtualizer( measurements: VirtualItem[], offset: number | null ) {
	return {
		takeSnapshot: () => measurements,
		scrollOffset: offset,
	} as unknown as Virtualizer< HTMLElement, Element >;
}

describe( 'useScrollRestore', () => {
	it( 'reads undefined for a key that was never saved', () => {
		expect( readScrollSnapshot( 'never-saved' ) ).toBeUndefined();
	} );

	it( 'saves measurements + offset on unmount, readable by key', () => {
		const measurements = [ { index: 0, key: 'a' } ] as unknown as VirtualItem[];
		const virtualizer = fakeVirtualizer( measurements, 540 );

		const { unmount } = renderHook( () => useScrollRestore( virtualizer, 'feed:list' ) );
		expect( readScrollSnapshot( 'feed:list' ) ).toBeUndefined(); // not saved until unmount

		unmount();

		expect( readScrollSnapshot( 'feed:list' ) ).toEqual( { measurements, offset: 540 } );
	} );

	it( 'treats a null scrollOffset as 0', () => {
		const virtualizer = fakeVirtualizer( [], null );

		const { unmount } = renderHook( () => useScrollRestore( virtualizer, 'feed:null-offset' ) );
		unmount();

		expect( readScrollSnapshot( 'feed:null-offset' ) ).toEqual( { measurements: [], offset: 0 } );
	} );

	it( 'does not save when no restore key is given', () => {
		const virtualizer = fakeVirtualizer( [], 10 );

		const { unmount } = renderHook( () => useScrollRestore( virtualizer, undefined ) );
		unmount();

		expect( readScrollSnapshot( undefined ) ).toBeUndefined();
	} );

	it( 'evicts old snapshots instead of growing without bound', () => {
		for ( let index = 0; index < 60; index++ ) {
			const { unmount } = renderHook( () =>
				useScrollRestore( fakeVirtualizer( [], index ), `feed:${ index }` )
			);
			unmount();
		}

		expect( readScrollSnapshot( 'feed:0' ) ).toBeUndefined();
		expect( readScrollSnapshot( 'feed:59' ) ).toEqual( { measurements: [], offset: 59 } );
	} );
} );
