import { get } from 'lodash';

import 'calypso/state/user-settings/init';

/**
 * Is two-step enabled for the current user?
 *
 * @param  {Object} state Global state tree
 * @returns {boolean} return true if two-step is enabled
 */
export default function isTwoStepEnabled( state ) {
	return get( state, 'userSettings.settings.two_step_enabled', null );
}
