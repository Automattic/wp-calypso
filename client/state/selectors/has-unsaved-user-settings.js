/**
 * External dependencies
 */

import { get, isEmpty } from 'lodash';

/**
 * Check if there are any unsaved settings
 *
 * @param  {object} state Global state tree
 * @returns {boolean} are there any unsaved settings?
 */
export default function hasUnsavedUserSettings( state ) {
	return ! isEmpty( get( state, 'userSettings.unsavedSettings' ) );
}
