/**
 * Internal dependencies
 */
import olarkApi from 'lib/olark-api';
import {
	OLARK_READY,
	OLARK_REQUEST,
	OLARK_TIMEOUT,
	OLARK_OPERATORS_AVAILABLE,
	OLARK_OPERATORS_AWAY,
	OLARK_CONFIG_FETCH,
	OLARK_CONFIG_RECEIVE,
	OLARK_CONFIG_ERROR,
} from 'state/action-types';
import { OLARK_TIMEOUT_MS } from './constants';
import wpcom from 'lib/wp';

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

export function configError( error ) {
	return {
		type: OLARK_CONFIG_ERROR,
		error,
	};
}

export function configReceive( context, options ) {
	return {
		type: OLARK_CONFIG_RECEIVE,
		context,
		options,
	};
}

export function fetchOlarkConfig( clientSlug, context ) {
	return ( dispatch ) => {
		dispatch( {
			type: OLARK_CONFIG_FETCH,
			context,
		} );

		wpcom.undocumented().getOlarkConfiguration( clientSlug, context )
			.then( options => dispatch( configReceive( context, options ) ) )
			.catch( error => dispatch( configError( error ) ) );
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
