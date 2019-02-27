/**
 * @format
 * @jest-environment jsdom
 */

/**
 * Internal dependencies
 */
import React from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';

let helpers;

const listeners = {};

const matchesMock = jest.fn( () => true );
const addListenerMock = jest.fn( ( query, listener ) => {
	if ( listeners[ query ] ) {
		listeners[ query ].push( listener );
	} else {
		listeners[ query ] = [ listener ];
	}
} );
const removeListenerMock = jest.fn( ( query, listener ) => {
	if ( listeners[ query ] ) {
		listeners[ query ] = listeners[ query ].filter( item => item !== listener );
	}
} );

function callQueryListeners( query, value ) {
	for ( const listener of listeners[ query ] ) {
		listener( { matches: value } );
	}
}

const matchMediaMock = jest.fn( query => {
	const mediaListObjectMock = {
		addListener: listener => addListenerMock( query, listener ),
		removeListener: listener => removeListenerMock( query, listener ),
	};
	// Add matches read-only property.
	Object.defineProperty( mediaListObjectMock, 'matches', {
		get: () => matchesMock( query ),
	} );
	return mediaListObjectMock;
} );

// Disable console warnings for this file.
// eslint-disable-next-line no-console
console.warn = jest.fn();

describe( 'viewport/react-helpers', () => {
	let container;

	// Auxiliary method to test a valid component.
	function runComponentTests( TestComponent, query ) {
		// Test initial state (defaults to true).
		act( () => {
			ReactDOM.render( <TestComponent />, container );
		} );

		expect( container.textContent ).toBe( 'true' );
		expect( listeners[ query ] ).not.toBe( undefined );
		expect( listeners[ query ].length ).toBe( 1 );

		// Simulate a window resize by calling the registered listeners for a query
		// with a different value (false).
		act( () => {
			callQueryListeners( query, false );
		} );

		expect( container.textContent ).toBe( 'false' );

		// Ensure that listeners are cleaned up when the component unmounts.
		act( () => {
			ReactDOM.render( <div />, container );
		} );

		expect( listeners[ query ].length ).toBe( 0 );
	}

	// Auxiliary class for HOC tests.
	class BaseComponent extends React.Component {
		render() {
			const isActive = this.props.isBreakpointActive;
			return isActive ? 'true' : 'false';
		}
	}

	beforeAll( async () => {
		window.matchMedia = matchMediaMock;
		helpers = await import( '../react-helpers' );
	} );

	beforeEach( () => {
		container = document.createElement( 'div' );
		matchesMock.mockClear();
		addListenerMock.mockClear();
		removeListenerMock.mockClear();
	} );

	describe( 'useBreakpoint', () => {
		test( 'returns undefined when called with no breakpoint', () => {
			function TestComponent() {
				const isActive = helpers.useBreakpoint();
				return isActive === undefined ? 'undefined' : `unexpected value: ${ isActive }`;
			}

			act( () => {
				ReactDOM.render( <TestComponent />, container );
			} );

			expect( container.textContent ).toBe( 'undefined' );
		} );

		test( 'returns undefined for an unknown breakpoint', () => {
			function TestComponent() {
				const isActive = helpers.useBreakpoint( 'unknown' );
				return isActive === undefined ? 'undefined' : `unexpected value: ${ isActive }`;
			}

			act( () => {
				ReactDOM.render( <TestComponent />, container );
			} );

			expect( container.textContent ).toBe( 'undefined' );
		} );

		test( 'returns the current breakpoint state for a valid breakpoint', () => {
			function TestComponent() {
				const isActive = helpers.useBreakpoint( '<960px' );
				return isActive ? 'true' : 'false';
			}

			runComponentTests( TestComponent, '(max-width: 960px)' );
		} );
	} );

	describe( 'useMobileBreakpoint', () => {
		test( 'returns the current breakpoint state for the mobile breakpoint', () => {
			function TestComponent() {
				const isActive = helpers.useMobileBreakpoint();
				return isActive ? 'true' : 'false';
			}

			runComponentTests( TestComponent, '(max-width: 480px)' );
		} );
	} );

	describe( 'useDesktopBreakpoint', () => {
		test( 'returns the current breakpoint state for the desktop breakpoint', () => {
			function TestComponent() {
				const isActive = helpers.useDesktopBreakpoint();
				return isActive ? 'true' : 'false';
			}

			runComponentTests( TestComponent, '(min-width: 961px)' );
		} );
	} );

	describe( 'withBreakpoint', () => {
		class ExpectUndefinedComponent extends React.Component {
			render() {
				const isActive = this.props.isBreakpointActive;
				return isActive === undefined ? 'undefined' : `unexpected value: ${ isActive }`;
			}
		}

		test( 'returns undefined when called with no breakpoint', () => {
			const TestComponent = helpers.withBreakpoint( ExpectUndefinedComponent );

			act( () => {
				ReactDOM.render( <TestComponent />, container );
			} );

			expect( container.textContent ).toBe( 'undefined' );
		} );

		test( 'returns undefined for an unknown breakpoint', () => {
			const TestComponent = helpers.withBreakpoint( ExpectUndefinedComponent, 'unknown' );

			act( () => {
				ReactDOM.render( <TestComponent />, container );
			} );

			expect( container.textContent ).toBe( 'undefined' );
		} );

		test( 'returns the current breakpoint state for a valid breakpoint', () => {
			const TestComponent = helpers.withBreakpoint( BaseComponent, '<960px' );
			runComponentTests( TestComponent, '(max-width: 960px)' );
		} );
	} );

	describe( 'withMobileBreakpoint', () => {
		test( 'returns the current breakpoint state for the mobile breakpoint', () => {
			const TestComponent = helpers.withMobileBreakpoint( BaseComponent );
			runComponentTests( TestComponent, '(max-width: 480px)' );
		} );
	} );

	describe( 'withDesktopBreakpoint', () => {
		test( 'returns the current breakpoint state for the desktop breakpoint', () => {
			const TestComponent = helpers.withDesktopBreakpoint( BaseComponent );
			runComponentTests( TestComponent, '(min-width: 961px)' );
		} );
	} );
} );
