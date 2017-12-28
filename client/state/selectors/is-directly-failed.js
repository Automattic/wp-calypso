/**
 * Tells whether the Directly RTM widget has failed to initialize
 * 
 * 
 *
 * @format
 * @see lib/directly for more about Directly
 * @param {Object}  state  Global state tree
 * @return {Boolean}        Whether the widget has failed
 */

/**
 * Internal dependencies
 */
import { STATUS_ERROR } from 'client/state/help/directly/constants';

export default function isDirectlyFailed( state ) {
	return state.help.directly.status === STATUS_ERROR;
}
