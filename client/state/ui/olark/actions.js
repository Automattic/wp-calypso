/**
 * Internal dependencies
 */
import olarkApi from 'lib/olark-api';
import {
	OLARK_READY,
	OLARK_REQUEST,
	OLARK_TIMEOUT
} from 'state/action-types';
import { OLARK_TIMEOUT_MS } from './constants';

/**
 * Returns an action object to be used in signalling that olark did not load
 * iin a timely manner
 *
 * @return {Object}              Action object
 */
export function olarkTimeout() {
	return {
		type: OLARK_TIMEOUT
	};
}

/**
 * Returns an action object to be used in signalling that olark is ready
 *
 * @return {Object}              Action object
 */
export function olarkReady() {
	return {
		type: OLARK_READY
	};
}

/**
 * Sets up a timeout to see if olark has loaded properly
 * @returns {Function}        Action thunk
 */
export function requestOlark() {
	return ( dispatch ) => {
		dispatch( {
			type: OLARK_REQUEST
		} );
		return new Promise( ( resolve ) => {
			const timeout = setTimeout( () => {
				dispatch( olarkTimeout() );
				resolve();
			}, OLARK_TIMEOUT_MS );
			olarkApi( 'api.chat.onReady', () => {
				clearTimeout( timeout );
				dispatch( olarkReady() );
				resolve();
			} );
		} );
	};
}
