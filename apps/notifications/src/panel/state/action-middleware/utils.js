/**
 * @typedef {Object.<string, Array.<Function>>} ActionHandler
 * 		An object that maps action types to arrays of handler methods.
 */

/**
 * Combines an array of action types and handler methods into one larger object,
 * containing one key for each action type and an associated array that
 * contains all that type's handler methods.
 * @param  {Array.<ActionHandler>} handlers An array of ActionHandlers.
 * @returns {ActionHandler} A combined representation of the inputs in one object.
 */
export const mergeHandlers = ( ...handlers ) => {
	if ( handlers.length === 1 ) {
		return handlers[ 0 ];
	}

	// For every handler passed in,
	return handlers.reduce( ( merged, nextHandler ) => {
		// get each of its action types and methods;
		Object.entries( nextHandler ).forEach( ( [ key, vals ] ) => {
			// if the current key doesn't exist in the reduced object,
			// initialize it to an empty array
			if ( ! ( key in merged ) ) {
				merged[ key ] = [];
			}

			// ... and add all those methods to that action type's key
			// in the reduced object
			merged[ key ].push( ...vals );
		} );

		return merged;
	}, {} );
};
