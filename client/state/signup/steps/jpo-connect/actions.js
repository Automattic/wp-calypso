/**
 * Internal dependencies
 */
import { SIGNUP_STEPS_JPO_CONNECT_SET } from 'state/action-types';

export function setJPOConnect( connect ) {
	console.log( 'setJPOConnect: ', connect );

	return {
		type: SIGNUP_STEPS_JPO_CONNECT_SET,
		connect
	};
}
