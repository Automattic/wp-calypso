/**
 * External dependencies
 */

import { has } from 'lodash';

/**
 * Check if a given settingName has an unsaved value present
 *
 * @param  {object} state Global state tree
 * @param  {string} settingName setting name
 * @returns {boolean} is there unsaved value for the setting?
 */
export default function isUserSettingUnsaved( state, settingName ) {
	return has( state, [ 'userSettings', 'unsavedSettings', settingName ] );
}
