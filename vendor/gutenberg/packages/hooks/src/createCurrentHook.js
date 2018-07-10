/**
 * Returns a function which, when invoked, will return the name of the
 * currently running hook, or `null` if no hook of the given type is currently
 * running.
 *
 * @param  {Object}   hooks          Stored hooks, keyed by hook name.
 *
 * @return {Function}                Function that returns the current hook.
 */
function createCurrentHook( hooks ) {
	/**
	 * Returns the name of the currently running hook, or `null` if no hook of
	 * the given type is currently running.
	 *
	 * @return {?string}             The name of the currently running hook, or
	 *                               `null` if no hook is currently running.
	 */
	return function currentHook() {
		if ( ! hooks.__current || ! hooks.__current.length ) {
			return null;
		}

		return hooks.__current[ hooks.__current.length - 1 ].name;
	};
}

export default createCurrentHook;
