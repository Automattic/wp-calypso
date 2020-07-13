/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns whether we are currently fetching or saving user settings for the current user.
 *
 * @param {object} state global app state
 * @returns {?boolean} whether we are fetching or saving user settings.
 */
export default function isFetchingUserSettings( state ) {
	return get( state, [ 'userSettings', 'fetchingSettings' ], false );
}
