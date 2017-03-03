/**
 * Get the configuration options used when initializing the Directly library
 *
 * @param {Object} state Global state tree
 * @return {Object} The configuration options used by Directly
 */
export default function getDirectlyConfig( state ) {
	return state.directly.config;
}
