/**
 * External dependencies
 */
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import {
	ALL_DOMAINS_RECEIVE,
	ALL_DOMAINS_REQUEST,
	ALL_DOMAINS_REQUEST_FAILURE,
	ALL_DOMAINS_REQUEST_SUCCESS,
} from 'state/action-types';

/**
 * Module vars
 */
const debug = debugFactory( 'calypso:state:all-domains:actions' );

/**
 * Returns an action object for signalling that a user's domains have been received.
 *
 * @param {object} domains - domains array gotten from WP REST-API response
 * @returns {object} the action object
 */
export const allDomainsReceiveAction = ( domains ) => {
	const action = {
		type: ALL_DOMAINS_RECEIVE,
		domains,
	};

	debug( 'returning action: %o', action );
	return action;
};

/**
 * Returns an action object to request a user's domains.
 *
 * @returns {object} siteId - action object
 */
export const allDomainsRequestAction = () => {
	const action = {
		type: ALL_DOMAINS_REQUEST,
	};

	debug( 'returning action: %o', action );
	return action;
};
/**
 * Returns an action object for signalling that a request was successful.
 *
 * @returns {object} siteId - action object
 */
export const allDomainsRequestSuccessAction = () => {
	const action = {
		type: ALL_DOMAINS_REQUEST_SUCCESS,
	};

	debug( 'returning action: %o', action );
	return action;
};

/**
 * Returns an action object for signalling that a request failed.
 *
 * @param {object} error - error message according to REST-API error response
 * @returns {object} action object
 */
export const allDomainsRequestFailureAction = ( error ) => {
	const action = {
		type: ALL_DOMAINS_REQUEST_FAILURE,
		error,
	};

	debug( 'returning action: %o', action );
	return action;
};
