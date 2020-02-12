/**
 * Internal dependencies
 */
import { APPLICATION_SET } from 'state/action-types';

//TODO: do we really want to mix strings and booleans?
export default function application( state = 'calypso', action ) {
	switch ( action.type ) {
		case APPLICATION_SET:
			return action.application !== undefined ? action.application : state;
	}
	return state;
}
