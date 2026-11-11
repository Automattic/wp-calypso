/**
 * @jest-environment jsdom
 */
import { fireEvent, render } from '@testing-library/react';
import { useCallback } from 'react';
import { useWindowResizeCallback, THROTTLE_RATE } from '..';

const initialRect = { width: 10, height: 10 };

describe( 'useWindowResizeCallback', () => {
	let lastRect;
	let callback;

	// Auxiliary function to create a test component.
	function createTestComponent( cb, mock ) {
		return function () {
			const resizeCallback = useCallback( cb, [] );
			const resizeRef = useWindowResizeCallback( resizeCallback );
			const ref = ( node ) => {
				if ( node ) {
					node.getBoundingClientRect = mock;
				}
				resizeRef.current = node;
			};

			return <div ref={ ref } />;
		};
	}

	beforeEach( () => {
		jest.useFakeTimers();

		callback = jest.fn( ( boundingClientRect ) => {
			lastRect = boundingClientRect;
		} );
	} );

	afterEach( () => {
		jest.runOnlyPendingTimers();
		jest.useRealTimers();
	} );

	// eslint-disable-next-line jest/expect-expect
	it( 'does not throw an error there is no callback', () => {
		const TestComponent = function () {
			const ref = useWindowResizeCallback();
			return <div ref={ ref } />;
		};

		render( <TestComponent /> );
	} );

	it( 'triggers an initial callback', () => {
		const getBoundingClientRectMock = jest.fn().mockReturnValueOnce( initialRect );
		const TestComponent = createTestComponent( callback, getBoundingClientRectMock );

		render( <TestComponent /> );

		expect( lastRect ).toBe( initialRect );
		expect( callback ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'triggers a callback when a resize takes place', () => {
		const secondRect = { height: 100, width: 100 };
		const getBoundingClientRectMock = jest
			.fn()
			.mockReturnValueOnce( initialRect )
			.mockReturnValueOnce( secondRect );

		const TestComponent = createTestComponent( callback, getBoundingClientRectMock );

		render( <TestComponent /> );

		expect( lastRect ).toBe( initialRect );

		// Fire resize event.
		fireEvent.resize( window );

		// Flush timer queue to trigger callbacks.
		jest.advanceTimersByTime( THROTTLE_RATE );

		expect( lastRect ).toBe( secondRect );
		expect( callback ).toHaveBeenCalledTimes( 2 );
	} );

	it( 'does not trigger a callback when a resize returns the same dimensions as before', () => {
		const secondRect = { height: 10, width: 10 };
		const getBoundingClientRectMock = jest
			.fn()
			.mockReturnValueOnce( initialRect )
			.mockReturnValueOnce( secondRect );

		const TestComponent = createTestComponent( callback, getBoundingClientRectMock );

		render( <TestComponent /> );

		expect( lastRect ).toBe( initialRect );

		// Fire resize event.
		fireEvent.resize( window );

		// Flush timer queue to trigger callbacks.
		jest.advanceTimersByTime( THROTTLE_RATE );

		expect( lastRect ).toBe( initialRect );
		expect( callback ).toHaveBeenCalledTimes( 1 );
	} );
} );
