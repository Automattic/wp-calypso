/**
 * Internal dependencies
 */
import { STATUS_ERROR } from 'state/help/directly/constants';

export default function isDirectlyFailed( state ) {
	return state.help.directly.status === STATUS_ERROR;
}
