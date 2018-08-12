/**
 * @format
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import afterLayoutFlush from '../';

jest.useFakeTimers();

// Simple mock for controlling requestAnimationFrame.
let pendingRafCallbacks = [];

function raf( func ) {
	pendingRafCallbacks.push( func );
}

function runRaf() {
	pendingRafCallbacks.forEach( callback => callback() );
	pendingRafCallbacks = [];
}

// Helper class used to test whether `this` is preserved.
class PreserveThisTest {
	constructor() {
		this.foo = 'bar';
		this.callback = jest.fn();
	}
}

// Wrap this in a method so we can call it at the right time and pick up
// the current state of `requestAnimationFrame` existence.
function setupPreserveThisTest() {
	PreserveThisTest.prototype.wrappedFunction = afterLayoutFlush( function() {
		return this.callback( this.foo );
	} );
}

describe( 'afterLayoutFlush', () => {
	describe( 'in browsers that support requestAnimationFrame', () => {
		beforeAll( () => {
			sinon.stub( window, 'requestAnimationFrame' ).callsFake( raf );
		} );

		test( 'should execute after a rAF followed by a timeout', () => {
			const callback = jest.fn();
			const wrappedFunction = afterLayoutFlush( callback );
			wrappedFunction();
			expect( callback ).not.toBeCalled();

			runRaf();
			expect( callback ).not.toBeCalled();

			jest.runAllTimers();
			expect( callback ).toHaveBeenCalledTimes( 1 );
		} );

		test( 'should preserve arguments passed to wrapped function', () => {
			const callback = jest.fn();
			const wrappedFunction = afterLayoutFlush( callback );
			wrappedFunction( 'foo', 'bar' );

			runRaf();
			jest.runAllTimers();

			expect( callback ).toHaveBeenCalledTimes( 1 );
			expect( callback ).toHaveBeenCalledWith( 'foo', 'bar' );
		} );

		test( 'should preserve `this` passed to wrapped function', () => {
			setupPreserveThisTest();
			const ptt = new PreserveThisTest();
			ptt.wrappedFunction();

			runRaf();
			jest.runAllTimers();

			expect( ptt.callback ).toHaveBeenCalledTimes( 1 );
			expect( ptt.callback ).toHaveBeenCalledWith( 'bar' );
		} );
	} );

	describe( 'in browsers that do not support requestAnimationFrame', () => {
		beforeAll( () => {
			sinon.restore();
			sinon.stub( window, 'requestAnimationFrame' ).value( undefined );
		} );

		test( 'should execute after a timeout', () => {
			const callback = jest.fn();

			const wrappedFunction = afterLayoutFlush( callback );
			wrappedFunction();
			expect( callback ).not.toBeCalled();

			jest.runAllTimers();
			expect( callback ).toHaveBeenCalledTimes( 1 );
		} );

		test( 'should preserve arguments passed to wrapped function', () => {
			const callback = jest.fn();
			const wrappedFunction = afterLayoutFlush( callback );
			wrappedFunction( 'foo', 'bar' );

			jest.runAllTimers();

			expect( callback ).toHaveBeenCalledTimes( 1 );
			expect( callback ).toHaveBeenCalledWith( 'foo', 'bar' );
		} );

		test( 'should preserve `this` passed to wrapped function', () => {
			setupPreserveThisTest();
			const ptt = new PreserveThisTest();
			ptt.wrappedFunction();

			jest.runAllTimers();

			expect( ptt.callback ).toHaveBeenCalledTimes( 1 );
			expect( ptt.callback ).toHaveBeenCalledWith( 'bar' );
		} );
	} );

	afterAll( () => sinon.restore() );
} );
