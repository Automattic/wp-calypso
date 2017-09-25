/**
 * Internal dependencies
 */
import { STATUS_READY } from 'state/help/directly/constants';

export default function getDirectlyStatus( state ) {
	return state.help.directly.status === STATUS_READY;
}
