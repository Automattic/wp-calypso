/**
 * External dependencies
 */
import { has } from 'lodash';

/**
 * Check if a given settingName has an unsaved value present
 *
 * @param  {Object} state Global state tree
 * @param  {String} settingName setting name
 * @return {Boolean} is there unsaved value for the setting?
 */
export default function isUserSettingUnsaved( state, settingName ) {
	return has( state, [ 'userSettings', 'unsavedSettings', settingName ] );
}
