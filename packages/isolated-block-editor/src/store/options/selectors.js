/**
 * Get the option value
 *
 * @param {object} state - Current state
 * @param {string} option - Option name
 * @returns {boolean} - Whether the option is active
 */
export function isOptionActive( state, option ) {
	return state.options[ option ] ? state.options[ option ] : false;
}
