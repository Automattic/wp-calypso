/**
 * Internal dependencies
 */
import {
	HELLO_WORLD_SET_NAME,
} from 'plugins/hello-world/state/action-types';

export default function( state = {}, action ) {
	switch ( action.type ) {
		case HELLO_WORLD_SET_NAME:
			return Object.assign( {}, state, { name: action.name } );
	}
	return state;
}
