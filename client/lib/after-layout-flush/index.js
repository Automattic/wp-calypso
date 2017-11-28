/** @format */

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
 * @param {Function} func The function to be invoked after the layout flush
 * @returns {Function} Returns the new delayed function
 */
export default function afterLayoutFlush( func ) {
	let rafHandle = undefined;
	let timeoutHandle = undefined;

	const scheduleRAF = rafFunc => () => {
		// if a RAF is already scheduled and not yet executed, don't schedule another one
		if ( rafHandle !== undefined ) {
			return;
		}

		rafHandle = requestAnimationFrame( () => {
			// clear the handle to signal that the scheduled RAF has been executed
			rafHandle = undefined;
			rafFunc();
		} );
	};

	const scheduleTimeout = timeoutFunc => () => {
		// If a timeout is already scheduled and not yet executed, don't schedule another one.
		// Multiple `requestAnimationFrame` handlers can be scheduled and executed before the
		// browser decides to finally execute the timeout handler.
		if ( timeoutHandle !== undefined ) {
			return;
		}

		timeoutHandle = setTimeout( () => {
			// clear the handle to signal that the timeout handler has been executed
			timeoutHandle = undefined;
			timeoutFunc();
		}, 0 );
	};

	// if RAF is not supported (in Node.js test environment), the wrapped function
	// will only set a timeout.
	let wrappedFunc = scheduleTimeout( func );
	if ( typeof requestAnimationFrame === 'function' ) {
		wrappedFunc = scheduleRAF( wrappedFunc );
	}

	wrappedFunc.cancel = () => {
		if ( rafHandle !== undefined ) {
			cancelAnimationFrame( rafHandle );
			rafHandle = undefined;
		}

		if ( timeoutHandle !== undefined ) {
			clearTimeout( timeoutHandle );
			timeoutHandle = undefined;
		}
	};

	return wrappedFunc;
}
