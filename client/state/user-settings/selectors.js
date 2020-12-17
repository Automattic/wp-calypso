/**
 * Returns whether there's currently a password change pending
 *
 * @param {object} state Global state tree
 */
export const isPendingPasswordChange = ( state ) => {
	return state.userSettings.pendingPasswordChange;
};
