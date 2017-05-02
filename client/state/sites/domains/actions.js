/**
 * External dependencies
 */
import debugFactory from 'debug';
import map from 'lodash/map';

/**
 * Internal dependencies
 */
import { createSiteDomainObject } from './assembler';
import wpcom from 'lib/wp';
import {
	SITE_DOMAINS_RECEIVE,
	SITE_DOMAINS_REQUEST,
	SITE_DOMAINS_REQUEST_SUCCESS,
	SITE_DOMAINS_REQUEST_FAILURE,
} from 'state/action-types';

/**
 * Module vars
 */
const debug = debugFactory( 'calypso:state:sites:domains:actions' );
const errorMessage = 'There was a problem fetching site domains. Please try again later or contact support.';

/**
 * Action creator function
 *
 * Returns an action object to be used in signalling that
 * an object containing the domains for
 * a given site have been received.
 *
 * @param {Number} siteId - identifier of the site
 * @param {Object} domains - domains array gotten from WP REST-API response
 * @returns {Object} the action object
 */
export const domainsReceiveAction = ( siteId, domains ) => {
	const action = {
		type: SITE_DOMAINS_RECEIVE,
		siteId,
		domains: map( domains, createSiteDomainObject )
	};

	debug( 'returning action: %o', action );
	return action;
};

/**
 * Action creator function
 *
 * Return SITE_DOMAINS_REQUEST action object
 *
 * @param {Number} siteId - side identifier
 * @return {Object} siteId - action object
 */
export const domainsRequestAction = siteId => {
	const action = {
		type: SITE_DOMAINS_REQUEST,
		siteId
	};

	debug( 'returning action: %o', action );
	return action;
};

/**
 * Action creator function
 *
 * Return SITE_DOMAINS_REQUEST_SUCCESS action object
 *
 * @param {Number} siteId - side identifier
 * @return {Object} siteId - action object
 */
export const domainsRequestSuccessAction = siteId => {
	const action = {
		type: SITE_DOMAINS_REQUEST_SUCCESS,
		siteId
	};

	debug( 'returning action: %o', action );
	return action;
};

/**
 * Action creator function
 *
 * Return SITE_DOMAINS_REQUEST_FAILURE action object
 *
 * @param {Number} siteId - site identifier
 * @param {Object} error - error message according to REST-API error response
 * @return {Object} action object
 */
export const domainsRequestFailureAction = ( siteId, error ) => {
	const action = {
		type: SITE_DOMAINS_REQUEST_FAILURE,
		siteId,
		error
	};

	debug( 'returning action: %o', action );
	return action;
};

/**
 * Fetches domains for the given site.
 *
 * @param {Number} siteId - identifier of the site
 * @returns {Function} a promise that will resolve once fetching is completed
 */
export function fetchSiteDomains( siteId ) {
	return dispatch => {
		dispatch( domainsRequestAction( siteId ) );

		return wpcom
			.site( siteId )
			.domainsList()
			.then( data => {
				const { domains = [] } = data;
				dispatch( domainsRequestSuccessAction( siteId ) );
				dispatch( domainsReceiveAction( siteId, domains ) );
			} )
			.catch( ( error = errorMessage ) => {
				const message = error instanceof Error
					? error.message
					: error;

				dispatch( domainsRequestFailureAction( siteId, message ) );
			} );
	};
}
