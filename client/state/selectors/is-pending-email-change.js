/**
 * External dependencies
 */

import { get } from 'lodash';

/**
 * Returns true if there is a pending email change, false if not.
 *
 * @param  {object} state Global state tree
 * @returns {boolean} pending email state
 */
export default function isPendingEmailChange( state ) {
	return get( state, 'userSettings.settings.new_user_email', null );
}
