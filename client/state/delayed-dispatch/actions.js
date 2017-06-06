/**
 * Internal dependencies
 */
import { DELAYED_DISPATCH } from '../action-types';

/**
 * Returns an action describing the intention to dispatch
 * a given action after a given delay
 *
 * @param {Number} delay waiting time in ms before dispatching action
 * @param {Object} payload action to dispatch
 * @param {String} [message=''] optional message for debugging purposes
 * @returns {Object} wrapped action indicating deferred dispatch intent
 */
export const delayDispatch = ( delay, payload, message = '' ) => Object.assign(
	{
		type: DELAYED_DISPATCH,
		payload,
		delay,
	},
	message && { message }
);
