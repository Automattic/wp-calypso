/**
 * Determines if the Directly library has been initialized and is executing
 *
 * @param {Object} state Global state tree
 * @return {Boolean} true if the Directly library has been initialized
 */
export default function isDirectlyInitialized( state ) {
	return state.directly.isInitialized;
}
