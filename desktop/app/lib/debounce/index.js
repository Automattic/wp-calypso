/**
 * Delays invoking `func` until `wait` milliseconds have elapsed since the last
 * time the returned function was called.
 *
 * Supports the `leading` and `trailing` edge options: with `leading`, `func`
 * runs on the first call of a burst; with `trailing` (the default), it runs
 * once `wait` ms have passed since the final call. When both are enabled the
 * trailing call only fires if the burst had more than one invocation.
 *
 * `func`'s `this` and arguments from the most recent call are forwarded. Only
 * the behavior used in this app is implemented — there is no `maxWait`, no
 * return value, and no `cancel`/`flush`.
 * @param {Function} func The function to debounce.
 * @param {number} wait The number of milliseconds to delay.
 * @param {{ leading?: boolean, trailing?: boolean }} [options] Edge options.
 * @returns {Function} The debounced function.
 */
module.exports = function debounce( func, wait, { leading = false, trailing = true } = {} ) {
	let timer = null;
	let lastArgs = null;
	let lastThis = null;

	function invoke() {
		const args = lastArgs;
		const thisArg = lastThis;
		lastArgs = null;
		lastThis = null;
		func.apply( thisArg, args );
	}

	return function ( ...args ) {
		const isLeadingEdge = timer === null;
		lastArgs = args;
		lastThis = this;

		// clearTimeout( null ) is a no-op, so no guard is needed on the leading edge.
		clearTimeout( timer );

		timer = setTimeout( () => {
			timer = null;
			// Fire the trailing edge only if a call arrived after any leading invoke;
			// otherwise release the retained args/context so nothing is pinned.
			if ( trailing && lastArgs ) {
				invoke();
			} else {
				lastArgs = null;
				lastThis = null;
			}
		}, wait );

		if ( isLeadingEdge && leading ) {
			invoke();
		}
	};
};
