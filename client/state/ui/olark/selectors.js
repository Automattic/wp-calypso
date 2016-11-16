/**
 * Internal dependencies
 */
import {
	STATUS_READY,
	STATUS_TIMEOUT,
	OPERATOR_STATUS_AVAILABLE
} from './constants';

/**
 * Returns if olark is ready for use.
 * @param   {Object}  state  Global state tree
 * @returns {Boolean}        true, when olark is ready
 */
export function isOlarkReady( state ) {
	return state.ui.olark.status === STATUS_READY;
}

/**
 * Returns if olark has not loaded in time.
 * @param   {Object}  state  Global state tree
 * @returns {Boolean}        true, when olark hasn't loaded within the timeout
 */
export function isOlarkTimedOut( state ) {
	return state.ui.olark.status === STATUS_TIMEOUT;
}

/**
 * Returns if olark is currently requesting status
 * @param   {Object}  state  Global state tree
 * @returns {Boolean}        true, when olark is requesting
 */
export function isRequestingOlark( state ) {
	return state.ui.olark.requesting;
}

export function getOlarkConfig( state, context ) {
	return state.ui.olark.config[ context ];
}

export function isRequestingConfig( state, context ) {
	const config = state.ui.olark.config[ context ];
	return !! ( config && config.isRequesting );
}

export function isEligibleForChat( state, context ) {
	const config = getOlarkConfig( state, context );
	return !! ( config && config.isUserEligible );
}

/**
 * Returns if olark operators are available.
 * @param   {Object}  state  Global state tree
 * @returns {Boolean}        true, when olark operators are available
 */
export function isOperatorsAvailable( state ) {
	return state.ui.olark.operatorStatus === OPERATOR_STATUS_AVAILABLE;
}
