/**
 * @jest-environment jsdom
 */

/* eslint jest/expect-expect: ["error", { "assertFunctionNames": ["runComponentTests", "expect"] }] */

import { act, Component, useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

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
		listeners[ query ] = listeners[ query ].filter( ( item ) => item !== listener );
	}
} );

function callQueryListeners( query, value ) {
	for ( const listener of listeners[ query ] ) {
		listener( { matches: value } );
	}
}

const matchMediaMock = jest.fn( ( query ) => {
	const mediaListObjectMock = {
		addListener: ( listener ) => addListenerMock( query, listener ),
		removeListener: ( listener ) => removeListenerMock( query, listener ),
	};
	// Add matches read-only property.
	Object.defineProperty( mediaListObjectMock, 'matches', {
		get: () => matchesMock( query ),
	} );
	return mediaListObjectMock;
} );

describe( '@automattic/viewport-react', () => {
	let container;
	let root;

	// Auxiliary method to test a valid component.
	function runComponentTests( TestComponent, query ) {
		// Test initial state (defaults to true).
		act( () => {
			root.render(
				<div>
					<TestComponent />
					<TestComponent />
					<TestComponent />
				</div>
			);
		} );

		expect( container.textContent ).toBe( 'truetruetrue' );
		expect( listeners[ query ] ).not.toBe( undefined );
		expect( listeners[ query ].length ).toBe( 3 );

		// Simulate a window resize by calling the registered listeners for a query
		// with a different value (false).
		act( () => {
			callQueryListeners( query, false );
		} );

		expect( container.textContent ).toBe( 'falsefalsefalse' );

		// Ensure that listeners are cleaned up when the component unmounts.
		act( () => {
			root.render( <div /> );
		} );

		expect( listeners[ query ].length ).toBe( 0 );
	}

	// Auxiliary class for HOC tests.
	class BaseComponent extends Component {
		render() {
			const isActive = this.props.isBreakpointActive;
			return isActive ? 'true' : 'false';
		}
	}

	beforeAll( async () => {
		window.matchMedia = matchMediaMock;
		helpers = await import( '../src' );
		// Disable console warnings.
		jest.spyOn( console, 'warn' ).mockImplementation( () => '' );
	} );

	beforeEach( () => {
		container = document.createElement( 'div' );
		document.body.appendChild( container );
		root = createRoot( container );

		matchesMock.mockClear();
		addListenerMock.mockClear();
		removeListenerMock.mockClear();
	} );

	afterEach( () => {
		act( () => {
			root.unmount();
		} );
		document.body.removeChild( container );
		root = null;
		container = null;
	} );

	afterAll( () => {
		jest.restoreAllMocks();
	} );

	describe( 'useBreakpoint', () => {
		test( 'returns undefined when called with no breakpoint', () => {
			function TestComponent() {
				const isActive = helpers.useBreakpoint();
				return isActive === undefined ? 'undefined' : `unexpected value: ${ isActive }`;
			}

			act( () => {
				root.render( <TestComponent /> );
			} );

			expect( container.textContent ).toBe( 'undefined' );
		} );

		test( 'returns undefined for an unknown breakpoint', () => {
			function TestComponent() {
				const isActive = helpers.useBreakpoint( 'unknown' );
				return isActive === undefined ? 'undefined' : `unexpected value: ${ isActive }`;
			}

			act( () => {
				root.render( <TestComponent /> );
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

		test( 'correctly updates if the breakpoint changes', () => {
			let callback;

			function TestComponent() {
				const [ query, setQuery ] = useState( '<960px' );
				const isActive = helpers.useBreakpoint( query );
				const changeQuery = () => setQuery( '<480px' );

				useEffect( () => {
					callback = changeQuery;
				} );

				return isActive ? 'true' : 'false';
			}

			// Test initial state (defaults to true).
			act( () => {
				root.render(
					<div>
						<TestComponent />
					</div>
				);
			} );

			expect( container.textContent ).toBe( 'true' );

			// Change to false.
			act( () => {
				callQueryListeners( '(max-width: 960px)', false );
			} );

			expect( container.textContent ).toBe( 'false' );

			// Change breakpoint, defaulting back to true.
			act( () => {
				callback();
			} );
			expect( container.textContent ).toBe( 'true' );
			expect( listeners[ '(max-width: 960px)' ].length ).toBe( 0 );
			expect( listeners[ '(max-width: 480px)' ].length ).toBe( 1 );

			// Ensure that listeners are cleaned up when the component unmounts.
			act( () => {
				root.render( <div /> );
			} );

			expect( listeners[ '(max-width: 480px)' ].length ).toBe( 0 );
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
		class ExpectUndefinedComponent extends Component {
			render() {
				const isActive = this.props.isBreakpointActive;
				return isActive === undefined ? 'undefined' : `unexpected value: ${ isActive }`;
			}
		}

		test( 'returns undefined when called with no breakpoint', () => {
			const TestComponent = helpers.withBreakpoint()( ExpectUndefinedComponent );

			act( () => {
				root.render( <TestComponent /> );
			} );

			expect( container.textContent ).toBe( 'undefined' );
		} );

		test( 'returns undefined for an unknown breakpoint', () => {
			const TestComponent = helpers.withBreakpoint( 'unknown' )( ExpectUndefinedComponent );

			act( () => {
				root.render( <TestComponent /> );
			} );

			expect( container.textContent ).toBe( 'undefined' );
		} );

		test( 'returns the current breakpoint state for a valid breakpoint', () => {
			const TestComponent = helpers.withBreakpoint( '<960px' )( BaseComponent );
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
