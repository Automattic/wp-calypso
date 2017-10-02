
/**
 * Curry a function which will ensure that the passed function is only executed once per
 * animation frame.
 *
 * @private
 * @param {Function} fn - The function which needs to be executed in the animation frame
 * @returns {Function} A function that can be called any number of times
 */
export function throttleToFrame( fn ) {
	let requestingFrame = false;
	return ( ...args ) => {
		if ( ! requestingFrame && typeof window !== 'undefined' ) {
			window.requestAnimationFrame( () => {
				requestingFrame = false;
				fn.apply( null, args );
			} );
			requestingFrame = true;
		}
	};
}

/**
 * Determine if an event occured at a point on the screen inside the given client rectangle.
 *
 * @private
 * @param {UIEvent} event - The event which occurred.
 * @param {any} rect - The client rectangle being tested
 * @returns {Boolean} Whether the event occurred in the client rect
 */
export function eventInsideRect( event, rect ) {
	const { clientX, clientY } = event;
	return rect.left < clientX && rect.right > clientX && rect.top < clientY && rect.bottom > clientY;
}
