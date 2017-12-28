/**
 * Tells whether the Directly RTM widget is ready to be used
 * 
 * 
 *
 * @format
 * @see lib/directly for more about Directly
 * @param {Object}  state  Global state tree
 * @return {Boolean}        Whether the widget is ready
 */

/**
 * Internal dependencies
 */
import { STATUS_READY } from 'client/state/help/directly/constants';

export default function getDirectlyStatus( state ) {
	return state.help.directly.status === STATUS_READY;
}
