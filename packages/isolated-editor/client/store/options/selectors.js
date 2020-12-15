/**
 * Get the option value
 *
 * @param {object} state - Current state
 * @param {string} option - Option name
 * @returns {boolean}
 */
export function isOptionActive( state, option ) {
	return state.options[ option ] ? state.options[ option ] : false;
}
