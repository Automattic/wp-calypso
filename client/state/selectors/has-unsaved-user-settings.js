import { get, isEmpty } from 'lodash';

import 'calypso/state/user-settings/init';

/**
 * Check if there are any unsaved settings
 *
 * @param  {Object} state Global state tree
 * @returns {boolean} are there any unsaved settings?
 */
export default function hasUnsavedUserSettings( state ) {
	return ! isEmpty( get( state, 'userSettings.unsavedSettings' ) );
}
