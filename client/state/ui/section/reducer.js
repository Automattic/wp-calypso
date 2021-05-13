/**
 * Internal dependencies
 */
import { SECTION_SET } from 'calypso/state/action-types';

//TODO: do we really want to mix strings and booleans?
export default function section( state = false, action ) {
	switch ( action.type ) {
		case SECTION_SET:
			return action.section !== undefined ? action.section : state;
	}
	return state;
}
