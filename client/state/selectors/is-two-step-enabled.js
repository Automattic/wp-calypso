/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Is two-step enabled for the current user?
 *
 * @param  {Object} state Global state tree
 * @return {Boolean} return true if two-step is enabled
 */
export default function isTwoStepEnabled( state ) {
	return get( state, 'userSettings.settings.two_step_enabled', null );
}
