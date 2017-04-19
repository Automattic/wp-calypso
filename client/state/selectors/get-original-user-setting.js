/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Given a settingName, returns that original setting if it exists or null
 *
 * @param  {Object} state Global state tree
 * @param  {String} settingName - setting name
 * @return {*} setting key value
 */
export default function getOriginalUserSetting( state, settingName ) {
	return get( state, [ 'userSettings', 'settings', settingName ], null );
}
