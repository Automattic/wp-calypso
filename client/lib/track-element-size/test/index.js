/**
 * @format
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import React, { useCallback } from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import _ from 'lodash';

jest.useFakeTimers();

jest.mock( 'lodash' );

// Mock Lodash's throttle implementation to avoid issues with Jest's fake timers.
_.throttle.mockImplementation( func => {
	const ret = ( ...args ) => setTimeout( () => func( ...args ), 0 );
	ret.cancel = () => null;
	return ret;
} );

import { useWindowResizeCallback, useWindowResizeRect } from '..';

const initialRect = { width: 10, height: 10 };

describe( 'useWindowResizeCallback', () => {
	let getBoundingClientRectMock;
	let container;
	let lastRect;
	let callback;

	// Auxiliary function to create a test component.
	function createTestComponent( cb, mock ) {
		return function() {
			const resizeCallback = useCallback( cb, [] );
			const resizeRef = useWindowResizeCallback( resizeCallback );
			const ref = node => {
				if ( node ) {
					node.getBoundingClientRect = mock;
				}
				resizeRef.current = node;
			};

			return <div ref={ ref } />;
		};
	}

	beforeEach( () => {
		container = document.createElement( 'div' );
		document.body.appendChild( container );

		getBoundingClientRectMock = jest.fn();
		getBoundingClientRectMock.mockReturnValueOnce( initialRect );

		callback = jest.fn( boundingClientRect => {
			lastRect = boundingClientRect;
		} );
	} );

	afterEach( () => {
		document.body.removeChild( container );
		ReactDOM.unmountComponentAtNode( container );
		container = null;
	} );

	it( 'does not throw an error there is no callback', () => {
		const TestComponent = function() {
			const ref = useWindowResizeCallback();
			return <div ref={ ref } />;
		};

		act( () => {
			ReactDOM.render( <TestComponent />, container );
		} );

		// Flush timer queue to trigger callbacks.
		act( () => {
			jest.runAllTimers();
		} );
	} );

	it( 'triggers an initial callback', () => {
		const TestComponent = createTestComponent( callback, getBoundingClientRectMock );

		act( () => {
			ReactDOM.render( <TestComponent />, container );
		} );

		// Flush timer queue to trigger callbacks.
		act( () => {
			jest.runAllTimers();
		} );

		expect( lastRect ).toBe( initialRect );
		expect( callback ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'triggers a callback when a resize takes place', () => {
		const secondRect = { height: 100, width: 100 };
		getBoundingClientRectMock = jest.fn();
		getBoundingClientRectMock.mockReturnValueOnce( initialRect ).mockReturnValueOnce( secondRect );

		const TestComponent = createTestComponent( callback, getBoundingClientRectMock );

		act( () => {
			ReactDOM.render( <TestComponent />, container );
		} );

		// Flush timer queue to trigger callbacks.
		act( () => {
			jest.runAllTimers();
		} );

		expect( lastRect ).toBe( initialRect );

		// Fire resize event.
		act( () => {
			global.dispatchEvent( new Event( 'resize' ) );
		} );

		// Flush timer queue to trigger callbacks.
		act( () => {
			jest.runAllTimers();
		} );

		expect( lastRect ).toBe( secondRect );
		expect( callback ).toHaveBeenCalledTimes( 2 );
	} );

	it( 'does not trigger a callback when a resize returns the same dimensions as before', () => {
		const secondRect = { height: 10, width: 10 };
		getBoundingClientRectMock = jest.fn();
		getBoundingClientRectMock.mockReturnValueOnce( initialRect ).mockReturnValueOnce( secondRect );

		const TestComponent = createTestComponent( callback, getBoundingClientRectMock );

		act( () => {
			ReactDOM.render( <TestComponent />, container );
		} );

		// Flush timer queue to trigger callbacks.
		act( () => {
			jest.runAllTimers();
		} );

		expect( lastRect ).toBe( initialRect );

		// Fire resize event.
		act( () => {
			global.dispatchEvent( new Event( 'resize' ) );
		} );

		// Flush timer queue to trigger callbacks.
		act( () => {
			jest.runAllTimers();
		} );

		expect( lastRect ).toBe( initialRect );
		expect( callback ).toHaveBeenCalledTimes( 1 );
	} );
} );

describe( 'useWindowResizeRect', () => {
	let getBoundingClientRectMock;
	let container;
	let lastRect;
	let renderTracker;

	// Auxiliary function to create a test component.
	function createTestComponent( mock ) {
		return function() {
			renderTracker();

			const [ resizeRef, rect ] = useWindowResizeRect();

			const ref = node => {
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
		container = document.createElement( 'div' );
		document.body.appendChild( container );

		renderTracker = jest.fn();

		getBoundingClientRectMock = jest.fn();
		getBoundingClientRectMock.mockReturnValueOnce( initialRect );
	} );

	afterEach( () => {
		document.body.removeChild( container );
		ReactDOM.unmountComponentAtNode( container );
		container = null;
	} );

	it( 'returns the initial rect', () => {
		const TestComponent = createTestComponent( getBoundingClientRectMock );

		act( () => {
			ReactDOM.render( <TestComponent />, container );
		} );

		// Flush timer queue to trigger callbacks.
		act( () => {
			jest.runAllTimers();
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
		getBoundingClientRectMock = jest
			.fn()
			.mockReturnValueOnce( initialRect )
			.mockReturnValueOnce( secondRect )
			.mockReturnValueOnce( secondRect );

		const TestComponent = createTestComponent( getBoundingClientRectMock );

		act( () => {
			ReactDOM.render( <TestComponent />, container );
		} );

		// Flush timer queue to trigger callbacks.
		act( () => {
			jest.runAllTimers();
		} );

		expect( container.textContent ).toBe( initialRect.width.toString() );
		expect( lastRect ).toBe( initialRect );

		// Fire resize event.
		act( () => {
			global.dispatchEvent( new Event( 'resize' ) );
		} );

		// Flush timer queue to trigger callbacks.
		act( () => {
			jest.runAllTimers();
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
		getBoundingClientRectMock = jest
			.fn()
			.mockReturnValueOnce( initialRect )
			.mockReturnValueOnce( secondRect )
			.mockReturnValueOnce( secondRect );

		const TestComponent = createTestComponent( getBoundingClientRectMock );

		act( () => {
			ReactDOM.render( <TestComponent />, container );
		} );

		// Flush timer queue to trigger callbacks.
		act( () => {
			jest.runAllTimers();
		} );

		expect( container.textContent ).toBe( initialRect.width.toString() );
		expect( lastRect ).toBe( initialRect );

		// Fire resize event.
		act( () => {
			global.dispatchEvent( new Event( 'resize' ) );
		} );

		// Flush timer queue to trigger callbacks.
		act( () => {
			jest.runAllTimers();
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
