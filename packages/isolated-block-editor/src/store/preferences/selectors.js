/**
 * Is the feature active?
 *
 * @param {object} state - Current state
 * @param {string} feature - Feature name
 */
export function isFeatureActive( state, feature ) {
	return state.preferences[ feature ] ? state.preferences[ feature ] : false;
}
