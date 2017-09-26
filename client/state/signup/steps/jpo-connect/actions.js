/** @format */
/**
 * External dependencies
 */
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import { SIGNUP_STEPS_JPO_CONNECT_SET } from 'state/action-types';

/**
 * Module constants
 */
const debug = debugFactory( 'calypso:jetpack-jpo:actions' );

export function setJpoConnect( connect ) {
	debug( 'setJpoConnect: ', connect );

	return {
		type: SIGNUP_STEPS_JPO_CONNECT_SET,
		connect,
	};
}
