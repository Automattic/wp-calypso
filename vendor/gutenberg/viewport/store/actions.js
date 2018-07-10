/**
 * Returns an action object used in signalling that viewport queries have been
 * updated. Values are specified as an object of breakpoint query keys where
 * value represents whether query matches.
 *
 * @param {Object} values Breakpoint query matches.
 *
 * @return {Object} Action object.
 */
export function setIsMatching( values ) {
	return {
		type: 'SET_IS_MATCHING',
		values,
	};
}
