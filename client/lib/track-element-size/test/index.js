/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import React, { useCallback } from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import { useFakeTimers } from 'sinon';

import { useWindowResizeCallback, useWindowResizeRect, THROTTLE_RATE } from '..';

const initialRect = { width: 10, height: 10 };

describe( 'useWindowResizeCallback', () => {
	let container;
	let lastRect;
	let callback;
	let clock;

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
		clock = useFakeTimers();
		container = document.createElement( 'div' );
		document.body.appendChild( container );

		callback = jest.fn( ( boundingClientRect ) => {
			lastRect = boundingClientRect;
		} );
	} );

	afterEach( () => {
		clock.restore();
		document.body.removeChild( container );
		ReactDOM.unmountComponentAtNode( container );
		container = null;
	} );

	it( 'does not throw an error there is no callback', () => {
		const TestComponent = function () {
			const ref = useWindowResizeCallback();
			return <div ref={ ref } />;
		};

		act( () => {
			ReactDOM.render( <TestComponent />, container );
		} );
	} );

	it( 'triggers an initial callback', () => {
		const getBoundingClientRectMock = jest.fn().mockReturnValueOnce( initialRect );
		const TestComponent = createTestComponent( callback, getBoundingClientRectMock );

		act( () => {
			ReactDOM.render( <TestComponent />, container );
		} );

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

		act( () => {
			ReactDOM.render( <TestComponent />, container );
		} );

		expect( lastRect ).toBe( initialRect );

		// Fire resize event.
		act( () => {
			global.dispatchEvent( new Event( 'resize' ) );
		} );

		// Flush timer queue to trigger callbacks.
		act( () => {
			clock.tick( THROTTLE_RATE );
		} );

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

		act( () => {
			ReactDOM.render( <TestComponent />, container );
		} );

		expect( lastRect ).toBe( initialRect );

		// Fire resize event.
		act( () => {
			global.dispatchEvent( new Event( 'resize' ) );
		} );

		// Flush timer queue to trigger callbacks.
		act( () => {
			clock.tick( THROTTLE_RATE );
		} );

		expect( lastRect ).toBe( initialRect );
		expect( callback ).toHaveBeenCalledTimes( 1 );
	} );
} );

describe( 'useWindowResizeRect', () => {
	let clock;
	let container;
	let lastRect;
	let renderTracker;

	// Auxiliary function to create a test component.
	function createTestComponent( mock ) {
		return function () {
			renderTracker();

			const [ resizeRef, rect ] = useWindowResizeRect();

			const ref = ( node ) => {
				if ( node ) {
					node.getBoundingClientRect = mock;
				}
				resizeRef.current = node;
			};

			lastRect = rect;

			return <div ref={ ref }>{ rect ? rect.width : 'unknown' }</div>;
		};
	}

	beforeEach( () => {
		clock = useFakeTimers();
		container = document.createElement( 'div' );
		document.body.appendChild( container );

		renderTracker = jest.fn();
	} );

	afterEach( () => {
		clock.restore();
		document.body.removeChild( container );
		ReactDOM.unmountComponentAtNode( container );
		container = null;
	} );

	it( 'returns the initial rect', () => {
		const getBoundingClientRectMock = jest
			.fn()
			.mockReturnValueOnce( initialRect )
			.mockReturnValueOnce( initialRect );

		const TestComponent = createTestComponent( getBoundingClientRectMock );

		act( () => {
			ReactDOM.render( <TestComponent />, container );
		} );

		expect( container.textContent ).toBe( initialRect.width.toString() );
		expect( lastRect ).toBe( initialRect );

		// We expect 2 renders:
		// - Initial render, where the ref gets applied
		// - Second render, where the rect values get updated after measuring the DOM
		expect( renderTracker ).toHaveBeenCalledTimes( 2 );
	} );

	it( 'returns the new rect when a resize takes place', () => {
		const secondRect = { height: 100, width: 100 };
		const getBoundingClientRectMock = jest
			.fn()
			.mockReturnValueOnce( initialRect )
			.mockReturnValueOnce( initialRect )
			.mockReturnValueOnce( secondRect )
			.mockReturnValueOnce( secondRect );

		const TestComponent = createTestComponent( getBoundingClientRectMock );

		act( () => {
			ReactDOM.render( <TestComponent />, container );
		} );

		expect( container.textContent ).toBe( initialRect.width.toString() );
		expect( lastRect ).toBe( initialRect );

		// Fire resize event.
		act( () => {
			global.dispatchEvent( new Event( 'resize' ) );
		} );

		// Flush timer queue to trigger callbacks.
		act( () => {
			clock.tick( THROTTLE_RATE );
		} );

		expect( container.textContent ).toBe( secondRect.width.toString() );
		expect( lastRect ).toBe( secondRect );

		// We expect 3 renders:
		// - Initial render, where the ref gets applied
		// - Second render, where the rect values get updated after measuring the DOM
		// - Third render, where the new rect values are returned after the resize
		expect( renderTracker ).toHaveBeenCalledTimes( 3 );
	} );

	it( 'does not rerender when a resize returns the same dimensions as before', () => {
		const secondRect = { height: 10, width: 10 };
		const getBoundingClientRectMock = jest
			.fn()
			.mockReturnValueOnce( initialRect )
			.mockReturnValueOnce( secondRect )
			.mockReturnValueOnce( secondRect );

		const TestComponent = createTestComponent( getBoundingClientRectMock );

		act( () => {
			ReactDOM.render( <TestComponent />, container );
		} );

		expect( container.textContent ).toBe( initialRect.width.toString() );
		expect( lastRect ).toBe( initialRect );

		// Fire resize event.
		act( () => {
			global.dispatchEvent( new Event( 'resize' ) );
		} );

		// Flush timer queue to trigger callbacks.
		act( () => {
			clock.tick( THROTTLE_RATE );
		} );

		expect( container.textContent ).toBe( initialRect.width.toString() );
		expect( lastRect ).toBe( initialRect );

		// We expect 2 renders:
		// - Initial render, where the ref gets applied
		// - Second render, where the rect values get updated after measuring the DOM
		// We do not expect a 3th render, where the rect would get updated, since
		// the dimensions haven't changed.
		expect( renderTracker ).toHaveBeenCalledTimes( 2 );
	} );
} );
