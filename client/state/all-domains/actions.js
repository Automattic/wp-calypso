/**
 * External dependencies
 */
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import {
	ALL_DOMAINS_REQUEST,
	ALL_DOMAINS_REQUEST_FAILURE,
	ALL_DOMAINS_REQUEST_SUCCESS,
} from 'calypso/state/action-types';

import 'calypso/state/all-domains/init';
import 'calypso/state/data-layer/wpcom/all-domains/index';

/**
 * Module vars
 */
const debug = debugFactory( 'calypso:state:all-domains:actions' );

/**
 * Returns an action object to request a user's domains.
 *
 * @returns {object} siteId - action object
 */
export const getAllDomainsRequest = () => {
	const action = {
		type: ALL_DOMAINS_REQUEST,
	};

	debug( 'returning action: %o', action );
	return action;
};
/**
 * Returns an action object for signalling that a request was successful and domains received.
 *
 * @param {object} domains - domains array gotten from WP REST-API response
 * @returns {object} siteId - action object
 */
export const getAllDomainsRequestSuccess = ( domains ) => {
	const action = {
		type: ALL_DOMAINS_REQUEST_SUCCESS,
		domains,
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
export const getAllDomainsRequestFailure = ( error ) => {
	const action = {
		type: ALL_DOMAINS_REQUEST_FAILURE,
		error,
	};

	debug( 'returning action: %o', action );
	return action;
};
