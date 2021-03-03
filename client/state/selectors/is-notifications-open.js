/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'calypso/state/ui/init';

/**
 * Returns true if the notifications panel is open.
 *
 * @param  {object}  state - Global state tree
 * @returns {boolean} true  - if notifications is open.
 *
 */
export default function isNotificationsOpen( state ) {
	return get( state, 'ui.isNotificationsOpen', false );
}
