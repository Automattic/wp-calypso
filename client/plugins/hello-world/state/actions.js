/**
 * Internal dependencies
 */
import {
	HELLO_WORLD_SET_NAME,
} from 'plugins/hello-world/state/action-types';

export function setName( name ) {
	return {
		type: HELLO_WORLD_SET_NAME,
		name,
	};
}
