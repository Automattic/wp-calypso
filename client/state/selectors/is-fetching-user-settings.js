/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns whether we are currently fetching user settings for the current user.
 *
 * @param {object} state global app state
 * @returns {?boolean} whether we are fetching user settings.
 */
export default function isFetchingUserSettings( state ) {
	return get( state, [ 'userSettings', 'fetchingSettings' ], false );
}
