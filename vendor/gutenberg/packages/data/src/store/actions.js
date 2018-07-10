/**
 * Returns an action object used in signalling that selector resolution has
 * started.
 *
 * @param {string} reducerKey   Registered store reducer key.
 * @param {string} selectorName Name of selector for which resolver triggered.
 * @param {...*}   args         Arguments to associate for uniqueness.
 *
 * @return {Object} Action object.
 */
export function startResolution( reducerKey, selectorName, args ) {
	return {
		type: 'START_RESOLUTION',
		reducerKey,
		selectorName,
		args,
	};
}

/**
 * Returns an action object used in signalling that selector resolution has
 * completed.
 *
 * @param {string} reducerKey   Registered store reducer key.
 * @param {string} selectorName Name of selector for which resolver triggered.
 * @param {...*}   args         Arguments to associate for uniqueness.
 *
 * @return {Object} Action object.
 */
export function finishResolution( reducerKey, selectorName, args ) {
	return {
		type: 'FINISH_RESOLUTION',
		reducerKey,
		selectorName,
		args,
	};
}
