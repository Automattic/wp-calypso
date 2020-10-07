/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns whether we are currently saving user settings for the current user.
 *
 * @param {object} state global app state
 * @returns {?boolean} whether we are saving user settings.
 */
export default function isSavingUserSettings( state ) {
	return get( state, [ 'userSettings', 'savingSettings' ], false );
}
