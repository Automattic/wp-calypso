import debugFactory from 'debug';
import { translate } from 'i18n-calypso';
import { map } from 'lodash';
import wpcom from 'calypso/lib/wp';
import {
	DOMAIN_CONTACT_INFO_DISCLOSE,
	DOMAIN_CONTACT_INFO_REDACT,
	DOMAIN_DNSSEC_DISABLE_SUCCESS,
	DOMAIN_DNSSEC_ENABLE_SUCCESS,
	DOMAIN_MANAGEMENT_PRIMARY_DOMAIN_SAVE_SUCCESS,
	DOMAIN_MANAGEMENT_PRIMARY_DOMAIN_UPDATE,
	DOMAIN_MARK_AS_PENDING_MOVE,
	DOMAIN_PRIVACY_DISABLE,
	DOMAIN_PRIVACY_ENABLE,
	SITE_DOMAINS_RECEIVE,
	SITE_DOMAINS_REQUEST,
	SITE_DOMAINS_REQUEST_FAILURE,
	SITE_DOMAINS_REQUEST_SUCCESS,
} from 'calypso/state/action-types';
import { requestSite } from 'calypso/state/sites/actions';
import { createSiteDomainObject } from './assembler';

import 'calypso/state/data-layer/wpcom/domains/privacy/index.js';

/**
 * Module vars
 */
const debug = debugFactory( 'calypso:state:sites:domains:actions' );

/**
 * Action creator function
 *
 * Returns an action object to be used in signalling that
 * an object containing the domains for
 * a given site have been received.
 * @param {number} siteId - identifier of the site
 * @param {Object} domains - domains array gotten from WP REST-API response
 * @returns {Object} the action object
 */
export const domainsReceiveAction = ( siteId, domains ) => {
	const action = {
		type: SITE_DOMAINS_RECEIVE,
		siteId,
		domains: map( domains, createSiteDomainObject ),
	};

	debug( 'returning action: %o', action );
	return action;
};

/**
 * Action creator function
 *
 * Return SITE_DOMAINS_REQUEST action object
 * @param {number} siteId - side identifier
 * @returns {Object} siteId - action object
 */
export const domainsRequestAction = ( siteId ) => {
	const action = {
		type: SITE_DOMAINS_REQUEST,
		siteId,
	};

	debug( 'returning action: %o', action );
	return action;
};

/**
 * Action creator function
 *
 * Return SITE_DOMAINS_REQUEST_SUCCESS action object
 * @param {number} siteId - side identifier
 * @returns {Object} siteId - action object
 */
export const domainsRequestSuccessAction = ( siteId ) => {
	const action = {
		type: SITE_DOMAINS_REQUEST_SUCCESS,
		siteId,
	};

	debug( 'returning action: %o', action );
	return action;
};

/**
 * Action creator function
 *
 * Return SITE_DOMAINS_REQUEST_FAILURE action object
 * @param {number} siteId - site identifier
 * @param {Object} error - error message according to REST-API error response
 * @returns {Object} action object
 */
export const domainsRequestFailureAction = ( siteId, error ) => {
	const action = {
		type: SITE_DOMAINS_REQUEST_FAILURE,
		siteId,
		error,
	};

	debug( 'returning action: %o', action );
	return action;
};

/**
 * Fetches domains for the given site.
 * @param {number} siteId - identifier of the site
 * @returns {Function} a promise that will resolve once fetching is completed
 */
export function fetchSiteDomains( siteId ) {
	return ( dispatch ) => {
		dispatch( domainsRequestAction( siteId ) );

		return wpcom.req
			.get( `/sites/${ siteId }/domains`, { apiVersion: '1.2' } )
			.then( ( data ) => {
				const { domains = [], error, message } = data;

				if ( error ) {
					throw new Error( message );
				}

				dispatch( domainsRequestSuccessAction( siteId ) );
				dispatch( domainsReceiveAction( siteId, domains ) );
			} )
			.catch( ( error ) => {
				const message =
					error instanceof Error
						? error.message
						: translate(
								'There was a problem fetching site domains. Please try again later or contact support.'
						  );

				dispatch( domainsRequestFailureAction( siteId, message ) );
			} );
	};
}

export function enableDomainPrivacy( siteId, domain ) {
	return {
		type: DOMAIN_PRIVACY_ENABLE,
		siteId,
		domain,
	};
}

export function disableDomainPrivacy( siteId, domain ) {
	return {
		type: DOMAIN_PRIVACY_DISABLE,
		siteId,
		domain,
	};
}

export function updatePrimaryDomainAction( siteId, domain ) {
	return {
		type: DOMAIN_MANAGEMENT_PRIMARY_DOMAIN_UPDATE,
		siteId,
		domain,
	};
}

export function updatePrimaryDomainCompleteAction( siteId, domain ) {
	return {
		type: DOMAIN_MANAGEMENT_PRIMARY_DOMAIN_SAVE_SUCCESS,
		siteId,
		domain,
	};
}

/**
 * @param {number} siteId
 * @param {string} domain
 */
export const setPrimaryDomain = ( siteId, domain ) => async ( dispatch ) => {
	dispatch( updatePrimaryDomainAction( siteId, domain ) );
	debug( 'setPrimaryDomain', siteId, domain );
	await wpcom.req.post( `/sites/${ siteId }/domains/primary`, { domain } );
	await Promise.all( [
		dispatch( requestSite( siteId ) ),
		dispatch( fetchSiteDomains( siteId ) ),
	] );
	dispatch( updatePrimaryDomainCompleteAction( siteId, domain ) );
};

export const disableDnssecAction = ( siteId, domain ) => {
	return {
		type: DOMAIN_DNSSEC_DISABLE_SUCCESS,
		siteId,
		domain,
	};
};

export const enableDnssecAction = ( siteId, domain, dnssecRecords ) => {
	return {
		type: DOMAIN_DNSSEC_ENABLE_SUCCESS,
		siteId,
		domain,
		dnssecRecords,
	};
};

export function discloseDomainContactInfo( siteId, domain ) {
	return {
		type: DOMAIN_CONTACT_INFO_DISCLOSE,
		siteId,
		domain,
	};
}

export function redactDomainContactInfo( siteId, domain ) {
	return {
		type: DOMAIN_CONTACT_INFO_REDACT,
		siteId,
		domain,
	};
}

export function markAsPendingMove( siteId, domain ) {
	return {
		type: DOMAIN_MARK_AS_PENDING_MOVE,
		siteId,
		domain,
	};
}
