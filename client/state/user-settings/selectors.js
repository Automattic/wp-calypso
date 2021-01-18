/**
 * Returns whether there's currently a password change pending
 *
 * @param {object} state Global state tree
 */
export const isPendingPasswordChange = ( state ) => state.userSettings.updatingPassword;

/*
 * Returns whether a request for updating user settings is currently in progress.
 *
 * @param {state} state State object
 */
export const isUpdatingUserSettings = ( state ) => state.userSettings.updating;
