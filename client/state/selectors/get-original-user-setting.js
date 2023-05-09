import { get } from 'lodash';

import 'calypso/state/user-settings/init';

/**
 * Given a settingName, returns that original setting if it exists or null
 *
 * @param  {Object} state Global state tree
 * @param  {string} settingName - setting name
 * @returns {*} setting key value
 */
export default function getOriginalUserSetting( state, settingName ) {
	return get( state, [ 'userSettings', 'settings', settingName ], null );
}
