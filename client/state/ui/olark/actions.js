/**
 * Internal dependencies
 */
import {
	OLARK_READY,
	OLARK_REQUEST,
	OLARK_TIMEOUT,
	OLARK_OPERATORS_AVAILABLE,
	OLARK_OPERATORS_AWAY,
	OLARK_SET_AVAILABILITY,
} from 'state/action-types';

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
 * Returns an action object to be used in signalling that olark operators are available
 *
 * @return {Object}              Action object
 */
export function operatorsAvailable() {
	return {
		type: OLARK_OPERATORS_AVAILABLE
	};
}

/**
 * Returns an action object to be used in signalling that olark operators are away
 *
 * @return {Object}              Action object
 */
export function operatorsAway() {
	return {
		type: OLARK_OPERATORS_AWAY
	};
}

/**
 * Returns an action object to be used in setting general chat availability
 * @param {object} availability  An object containing the availibility of different areas for chat
 * @return {Object}              Action object
 */
export function setChatAvailability( availability ) {
	return {
		type: OLARK_SET_AVAILABILITY,
		availability,
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
			dispatch( olarkTimeout() );
			resolve();
		} );
	};
}
