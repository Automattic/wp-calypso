/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { useScrollSelectedIntoView } from '../use-scroll-selected-into-view';

describe( 'useScrollSelectedIntoView', () => {
	it( 'scrolls the selected index into view', () => {
		const scrollToIndex = jest.fn();
		renderHook( () => useScrollSelectedIntoView( scrollToIndex, 3 ) );

		expect( scrollToIndex ).toHaveBeenCalledWith( 3, { align: 'auto' } );
	} );

	it( 'does not scroll when nothing is selected', () => {
		const scrollToIndex = jest.fn();
		renderHook( () => useScrollSelectedIntoView( scrollToIndex, -1 ) );

		expect( scrollToIndex ).not.toHaveBeenCalled();
	} );

	it( 'scrolls again when the selected index changes', () => {
		const scrollToIndex = jest.fn();
		const { rerender } = renderHook(
			( { index } ) => useScrollSelectedIntoView( scrollToIndex, index ),
			{ initialProps: { index: 1 } }
		);

		rerender( { index: 4 } );

		expect( scrollToIndex ).toHaveBeenNthCalledWith( 1, 1, { align: 'auto' } );
		expect( scrollToIndex ).toHaveBeenNthCalledWith( 2, 4, { align: 'auto' } );
	} );
} );
