/**
 * Tells whether the Directly RTM widget is ready to be used
 *
 *
 *
 * @see lib/directly for more about Directly
 * @param {object}  state  Global state tree
 * @returns {boolean}        Whether the widget is ready
 */

/**
 * Internal dependencies
 */
import { STATUS_READY } from 'state/help/directly/constants';

export default function getDirectlyStatus( state ) {
	return state.help.directly.status === STATUS_READY;
}
