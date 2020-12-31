/**
 * Returns true if reusable block is in the editing state.
 *
 * @param {Object} state Global application state.
 * @param {number} clientId the clientID of the block.
 * @returns {boolean} Whether the reusable block is in the editing state.
 */
export function __experimentalIsEditingReusableBlock( state, clientId ) {
	return state.isEditingReusableBlock[ clientId ];
}
