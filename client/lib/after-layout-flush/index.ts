/**
 * Internal dependencies
 */
import { TimerHandle } from 'types';

interface Cancelable {
	cancel: () => void;
}

/**
 * Creates a delayed function that invokes `func` as soon as possible after the next layout
 * flush. At that time, it is very unlikely that the DOM has been written to since the last
 * layout and it should be safe to read from DOM without causing a synchronous reflow, i.e.,
 * cheaply and without any performance hit.
 *
 * The returned wrapped function comes with a `cancel` method that cancels the delayed invocations.
 *
 * Inspired by the Firefox performance best practices MDN article at:
 * https://developer.mozilla.org/en-US/Firefox/Performance_best_practices_for_Firefox_fe_engineers
 *
 * @param func - The function to be invoked after the layout flush
 * @returns The new delayed function
 */
export default function afterLayoutFlush< T extends ( ...args: any[] ) => any >( func: T ) {
	let timeoutHandle: TimerHandle | undefined = undefined;
	let rafHandle: number | undefined = undefined;

	const hasRAF = typeof requestAnimationFrame === 'function';

	let lastThis: any;
	let lastArgs: any[] | undefined;

	const scheduleRAF = function ( rafFunc: T ) {
		return function ( this: any, ...args: any[] ) {
			lastThis = this;
			lastArgs = args;

			// if a RAF is already scheduled and not yet executed, don't schedule another one
			if ( rafHandle !== undefined ) {
				return;
			}

			rafHandle = requestAnimationFrame( () => {
				// clear the handle to signal that the scheduled RAF has been executed
				rafHandle = undefined;
				rafFunc();
			} );
		} as T;
	};

	const scheduleTimeout = function ( timeoutFunc: T ) {
		return function ( this: any, ...args: any[] ) {
			if ( ! hasRAF ) {
				lastThis = this;
				lastArgs = args;
			}

			// If a timeout is already scheduled and not yet executed, don't schedule another one.
			// Multiple `requestAnimationFrame` handlers can be scheduled and executed before the
			// browser decides to finally execute the timeout handler.
			if ( timeoutHandle !== undefined ) {
				return;
			}

			timeoutHandle = setTimeout( () => {
				const callArgs = lastArgs !== undefined ? lastArgs : [];
				const callThis = lastThis;

				lastArgs = undefined;
				lastThis = undefined;

				// clear the handle to signal that the timeout handler has been executed
				timeoutHandle = undefined;
				timeoutFunc.apply( callThis, callArgs );
			}, 0 );
		} as T;
	};

	// if RAF is not supported (in Node.js test environment), the wrapped function
	// will only set a timeout.
	let wrappedFunc: T = scheduleTimeout( func );
	if ( hasRAF ) {
		wrappedFunc = scheduleRAF( wrappedFunc );
	}

	const wrappedWithCancel = wrappedFunc as T & Cancelable;
	wrappedWithCancel.cancel = () => {
		lastThis = undefined;
		lastArgs = undefined;

		if ( rafHandle !== undefined ) {
			cancelAnimationFrame( rafHandle );
			rafHandle = undefined;
		}

		if ( timeoutHandle !== undefined ) {
			clearTimeout( timeoutHandle );
			timeoutHandle = undefined;
		}
	};

	return wrappedWithCancel;
}
