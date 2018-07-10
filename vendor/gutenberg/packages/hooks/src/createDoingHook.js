/**
 * Returns a function which, when invoked, will return whether a hook is
 * currently being executed.
 *
 * @param  {Object}   hooks Stored hooks, keyed by hook name.
 *
 * @return {Function}       Function that returns whether a hook is currently
 *                          being executed.
 */
function createDoingHook( hooks ) {
	/**
	 * Returns whether a hook is currently being executed.
	 *
	 * @param  {?string} hookName The name of the hook to check for.  If
	 *                            omitted, will check for any hook being executed.
	 *
	 * @return {boolean}             Whether the hook is being executed.
	 */
	return function doingHook( hookName ) {
		// If the hookName was not passed, check for any current hook.
		if ( 'undefined' === typeof hookName ) {
			return 'undefined' !== typeof hooks.__current[ 0 ];
		}

		// Return the __current hook.
		return hooks.__current[ 0 ] ?
			hookName === hooks.__current[ 0 ].name :
			false;
	};
}

export default createDoingHook;
