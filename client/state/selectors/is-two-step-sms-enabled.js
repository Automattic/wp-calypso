/**
 * External dependencies
 */

import { get } from 'lodash';

/**
 * Is two-step sms enabled for the current user?
 *
 * @param  {object} state Global state tree
 * @returns {boolean} return true if two-step sms is enabled
 */
export default function isTwoStepSmsEnabled( state ) {
	return get( state, 'userSettings.settings.two_step_sms_enabled', null );
}
