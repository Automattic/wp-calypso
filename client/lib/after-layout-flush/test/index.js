/**
 * @vitest-environment jsdom
 */
import { vi } from 'vitest';
import afterLayoutFlush from '../';

vi.useFakeTimers();

// Simple mocks for controlling requestAnimationFrame and cancelAnimationFrame.
let pendingRafCallbacks = [];

function requestAnimationFrameFake( func ) {
	pendingRafCallbacks.push( func );
	return func;
}

function cancelAnimationFrameFake( func ) {
	pendingRafCallbacks = pendingRafCallbacks.filter( ( item ) => item !== func );
}

function clearAnimationFrameCallbacks() {
	pendingRafCallbacks = [];
}

function runAnimationFrame() {
	pendingRafCallbacks.forEach( ( callback ) => callback() );
	clearAnimationFrameCallbacks();
}

// Helper class used to test whether `this` is preserved.
class PreserveThisTest {
	constructor() {
		this.foo = 'bar';
		this.callback = vi.fn();
	}
}

// Wrap this in a method so we can call it at the right time and pick up
// the current state of `requestAnimationFrame` existence.
function setupPreserveThisTest() {
	PreserveThisTest.prototype.wrappedFunction = afterLayoutFlush( function () {
		return this.callback( this.foo );
	} );
}

describe( 'afterLayoutFlush', () => {
	describe( 'in browsers that support requestAnimationFrame', () => {
		beforeAll( () => {
			vi.spyOn( window, 'requestAnimationFrame' ).mockImplementation( requestAnimationFrameFake );
			vi.spyOn( window, 'cancelAnimationFrame' ).mockImplementation( cancelAnimationFrameFake );
		} );

		beforeEach( () => {
			clearAnimationFrameCallbacks();
		} );

		test( 'should execute after a rAF followed by a timeout', () => {
			const callback = vi.fn();
			const wrappedFunction = afterLayoutFlush( callback );
			wrappedFunction();
			expect( callback ).not.toHaveBeenCalled();

			runAnimationFrame();
			expect( callback ).not.toHaveBeenCalled();

			vi.runAllTimers();
			expect( callback ).toHaveBeenCalledTimes( 1 );
		} );

		test( 'should cancel execution if `cancel` is called before the rAF', () => {
			const callback = vi.fn();
			const wrappedFunction = afterLayoutFlush( callback );
			wrappedFunction();

			wrappedFunction.cancel();
			runAnimationFrame();
			vi.runAllTimers();

			expect( callback ).not.toHaveBeenCalled();
		} );

		test( 'should cancel execution if `cancel` is called before the timeout', () => {
			const callback = vi.fn();
			const wrappedFunction = afterLayoutFlush( callback );
			wrappedFunction();

			runAnimationFrame();
			wrappedFunction.cancel();
			vi.runAllTimers();

			expect( callback ).not.toHaveBeenCalled();
		} );

		test( 'should not throw if `cancel` is called after execution', () => {
			const callback = vi.fn();
			const wrappedFunction = afterLayoutFlush( callback );
			wrappedFunction();

			runAnimationFrame();
			vi.runAllTimers();

			expect( callback ).toHaveBeenCalled();
			expect( () => wrappedFunction.cancel() ).not.toThrow();
		} );

		test( 'should preserve arguments passed to wrapped function', () => {
			const callback = vi.fn();
			const wrappedFunction = afterLayoutFlush( callback );
			wrappedFunction( 'foo', 'bar' );

			runAnimationFrame();
			vi.runAllTimers();

			expect( callback ).toHaveBeenCalledTimes( 1 );
			expect( callback ).toHaveBeenCalledWith( 'foo', 'bar' );
		} );

		test( 'should preserve the last arguments passed to wrapped function', () => {
			const callback = vi.fn();
			const wrappedFunction = afterLayoutFlush( callback );

			wrappedFunction( 1, 1 );
			runAnimationFrame();
			wrappedFunction( 2, 2 );
			vi.runAllTimers();
			wrappedFunction( 3, 3 );

			expect( callback ).toHaveBeenCalledTimes( 1 );
			expect( callback ).toHaveBeenCalledWith( 2, 2 );
		} );

		test( 'should preserve `this` passed to wrapped function', () => {
			setupPreserveThisTest();
			const ptt = new PreserveThisTest();
			ptt.wrappedFunction();

			runAnimationFrame();
			vi.runAllTimers();

			expect( ptt.callback ).toHaveBeenCalledTimes( 1 );
			expect( ptt.callback ).toHaveBeenCalledWith( 'bar' );
		} );
	} );

	describe( 'in browsers that do not support requestAnimationFrame', () => {
		let originalRequestAnimationFrame;
		beforeAll( () => {
			originalRequestAnimationFrame = window.requestAnimationFrame;
			window.requestAnimationFrame = undefined;
		} );

		afterAll( () => {
			window.requestAnimationFrame = originalRequestAnimationFrame;
		} );

		test( 'should execute after a timeout', () => {
			const callback = vi.fn();

			const wrappedFunction = afterLayoutFlush( callback );
			wrappedFunction();
			expect( callback ).not.toHaveBeenCalled();

			vi.runAllTimers();
			expect( callback ).toHaveBeenCalledTimes( 1 );
		} );

		test( 'should cancel execution if `cancel` is called before the timeout', () => {
			const callback = vi.fn();
			const wrappedFunction = afterLayoutFlush( callback );
			wrappedFunction();

			wrappedFunction.cancel();
			vi.runAllTimers();

			expect( callback ).not.toHaveBeenCalled();
		} );

		test( 'should not throw if `cancel` is called after execution', () => {
			const callback = vi.fn();
			const wrappedFunction = afterLayoutFlush( callback );
			wrappedFunction();

			vi.runAllTimers();

			expect( callback ).toHaveBeenCalled();
			expect( () => wrappedFunction.cancel() ).not.toThrow();
		} );

		test( 'should preserve arguments passed to wrapped function', () => {
			const callback = vi.fn();
			const wrappedFunction = afterLayoutFlush( callback );
			wrappedFunction( 'foo', 'bar' );

			vi.runAllTimers();

			expect( callback ).toHaveBeenCalledTimes( 1 );
			expect( callback ).toHaveBeenCalledWith( 'foo', 'bar' );
		} );

		test( 'should preserve the last arguments passed to wrapped function', () => {
			const callback = vi.fn();
			const wrappedFunction = afterLayoutFlush( callback );

			wrappedFunction( 1, 1 );
			wrappedFunction( 2, 2 );
			vi.runAllTimers();
			wrappedFunction( 3, 3 );

			expect( callback ).toHaveBeenCalledTimes( 1 );
			expect( callback ).toHaveBeenCalledWith( 2, 2 );
		} );

		test( 'should preserve `this` passed to wrapped function', () => {
			setupPreserveThisTest();
			const ptt = new PreserveThisTest();
			ptt.wrappedFunction();

			vi.runAllTimers();

			expect( ptt.callback ).toHaveBeenCalledTimes( 1 );
			expect( ptt.callback ).toHaveBeenCalledWith( 'bar' );
		} );
	} );
} );
