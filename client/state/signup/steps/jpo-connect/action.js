/**
 * External dependencies
 */
const debug = require( 'debug' )( 'calypso:jetpack-jpo:actions' );

/**
 * Internal dependencies
 */
import { SIGNUP_STEPS_JPO_CONNECT_SET } from 'state/action-types';

export function setJPOConnect( connect ) {
	debug( 'setJPOConnect: ', connect );

	return {
		type: SIGNUP_STEPS_JPO_CONNECT_SET,
		connect
	};
}
