/**
 * Internal dependencies
 */
import { STATUS_UNINITIALIZED } from 'state/help/directly/constants';

export default function isDirectlyUninitialized( state ) {
	return state.help.directly.status === STATUS_UNINITIALIZED;
}
