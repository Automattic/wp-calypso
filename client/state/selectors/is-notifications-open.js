/** @format */
/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns true if the notifications panel is open.
 *
 * @param  {Object}  state - Global state tree
 * @return {Boolean} true  - if notifications is open.
 *
 */
export default function isNotificationsOpen( state ) {
	return get( state, 'ui.isNotificationsOpen', false );
}
