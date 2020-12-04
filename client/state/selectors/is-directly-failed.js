/**
 * Tells whether the Directly RTM widget has failed to initialize
 *
 *
 *
 * @see lib/directly for more about Directly
 * @param {object}  state  Global state tree
 * @returns {boolean}        Whether the widget has failed
 */

/**
 * Internal dependencies
 */
import { STATUS_ERROR } from 'calypso/state/help/directly/constants';

import 'calypso/state/help/init';

export default function isDirectlyFailed( state ) {
	return state.help?.directly.status === STATUS_ERROR;
}
