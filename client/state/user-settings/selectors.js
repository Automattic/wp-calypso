import 'calypso/state/user-settings/init';

/**
 *
 * @param {Object} state Global state tree
 */
export const isFetchingUserSettings = ( state ) => state.userSettings.fetching;

/**
 * Returns whether there's currently a password change pending
 *
 * @param {Object} state Global state tree
 */
export const isPendingPasswordChange = ( state ) => state.userSettings.updatingPassword;

/*
 * Returns whether a request for updating user settings is currently in progress.
 *
 * @param {state} state State object
 */
export const isUpdatingUserSettings = ( state ) => state.userSettings.updating;

/*
 * Returns whether the previous request to save or retrieve the settings, failed.
 *
 * @param {state} state State object
 */
export const hasUserSettingsRequestFailed = ( state ) => state.userSettings.failed;
