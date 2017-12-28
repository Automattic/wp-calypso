/**
 * Tells whether the Directly RTM widget has started initialization
 * 
 * 
 *
 * @format
 * @see lib/directly for more about Directly
 * @param {Object}  state  Global state tree
 * @return {Boolean}        Whether the widget is waiting to be initialized
 */

/**
 * Internal dependencies
 */
import { STATUS_UNINITIALIZED } from 'client/state/help/directly/constants';

export default function isDirectlyUninitialized( state ) {
	return state.help.directly.status === STATUS_UNINITIALIZED;
}
