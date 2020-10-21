/* eslint-disable no-case-declarations */
/**
 * External dependencies
 */
import { find, indexOf } from 'lodash';

/**
 * Internal dependencies
 */
import {
	SITE_DOMAINS_RECEIVE,
	SITE_DOMAINS_REQUEST,
	SITE_DOMAINS_REQUEST_SUCCESS,
	SITE_DOMAINS_REQUEST_FAILURE,
	DOMAIN_PRIVACY_ENABLE,
	DOMAIN_PRIVACY_DISABLE,
	DOMAIN_PRIVACY_ENABLE_SUCCESS,
	DOMAIN_PRIVACY_DISABLE_SUCCESS,
	DOMAIN_PRIVACY_ENABLE_FAILURE,
	DOMAIN_PRIVACY_DISABLE_FAILURE,
	DOMAIN_CONTACT_INFO_DISCLOSE,
	DOMAIN_CONTACT_INFO_DISCLOSE_SUCCESS,
	DOMAIN_CONTACT_INFO_DISCLOSE_FAILURE,
	DOMAIN_CONTACT_INFO_REDACT,
	DOMAIN_CONTACT_INFO_REDACT_SUCCESS,
	DOMAIN_CONTACT_INFO_REDACT_FAILURE,
} from 'calypso/state/action-types';
import { combineReducers, withSchemaValidation } from 'calypso/state/utils';
import { itemsSchema } from './schema';

/**
 * Returns a copy of the domains state object with some modifications
 *
 * @param {object} state - current state
 * @param {int} siteId - site ID
 * @param {string} domain - domain name
 * @param {object} modifyDomainProperties - object with modified site domain properties
 * @returns {any} - new copy of the state
 */
const modifySiteDomainObjectImmutable = ( state, siteId, domain, modifyDomainProperties ) => {
	// Find the domain we want to update
	const targetDomain = find( state[ siteId ], { domain: domain } );
	const domainIndex = indexOf( state[ siteId ], targetDomain );
	// Copy as we shouldn't mutate original state
	const newDomains = [ ...state[ siteId ] ];
	// Update privacy
	newDomains.splice( domainIndex, 1, Object.assign( {}, targetDomain, modifyDomainProperties ) );

	return Object.assign( {}, state, {
		[ siteId ]: newDomains,
	} );
};

/**
 * Domains `Reducer` function
 *
 * @param {object} state - current state
 * @param {object} action - domains action
 * @returns {object} updated state
 */
export const items = withSchemaValidation( itemsSchema, ( state = {}, action ) => {
	const { siteId } = action;
	switch ( action.type ) {
		case SITE_DOMAINS_RECEIVE:
			return Object.assign( {}, state, {
				[ siteId ]: action.domains,
			} );
		case DOMAIN_PRIVACY_ENABLE_SUCCESS:
			return modifySiteDomainObjectImmutable( state, siteId, action.domain, {
				privateDomain: true,
				contactInfoDisclosed: false,
			} );
		case DOMAIN_PRIVACY_DISABLE_SUCCESS:
			return modifySiteDomainObjectImmutable( state, siteId, action.domain, {
				privateDomain: false,
				contactInfoDisclosed: false,
			} );
		case DOMAIN_CONTACT_INFO_DISCLOSE_SUCCESS:
			return modifySiteDomainObjectImmutable( state, siteId, action.domain, {
				privateDomain: false,
				contactInfoDisclosed: true,
			} );
		case DOMAIN_CONTACT_INFO_REDACT_SUCCESS:
			return modifySiteDomainObjectImmutable( state, siteId, action.domain, {
				privateDomain: false,
				contactInfoDisclosed: false,
			} );
	}

	return state;
} );

/**
 * Updating privacy reducer
 *
 * Figure out if we're in the middle of privacy modification command
 *
 * @param {object} state - current state
 * @param {object} action - action
 * @returns {any} - new state
 */
export const updatingPrivacy = ( state = {}, action ) => {
	switch ( action.type ) {
		case DOMAIN_PRIVACY_ENABLE:
		case DOMAIN_PRIVACY_ENABLE_SUCCESS:
		case DOMAIN_PRIVACY_ENABLE_FAILURE:
		case DOMAIN_PRIVACY_DISABLE:
		case DOMAIN_PRIVACY_DISABLE_SUCCESS:
		case DOMAIN_PRIVACY_DISABLE_FAILURE:
		case DOMAIN_CONTACT_INFO_DISCLOSE:
		case DOMAIN_CONTACT_INFO_DISCLOSE_SUCCESS:
		case DOMAIN_CONTACT_INFO_DISCLOSE_FAILURE:
		case DOMAIN_CONTACT_INFO_REDACT:
		case DOMAIN_CONTACT_INFO_REDACT_SUCCESS:
		case DOMAIN_CONTACT_INFO_REDACT_FAILURE:
			return Object.assign( {}, state, {
				[ action.siteId ]: {
					[ action.domain ]:
						[
							DOMAIN_PRIVACY_ENABLE,
							DOMAIN_PRIVACY_DISABLE,
							DOMAIN_CONTACT_INFO_DISCLOSE,
							DOMAIN_CONTACT_INFO_REDACT,
						].indexOf( action.type ) !== -1,
				},
			} );
	}

	return state;
};

/**
 * `Reducer` function which handles request/response actions
 * to/from WP REST-API
 *
 * @param {object} state - current state
 * @param {object} action - domains action
 * @returns {object} updated state
 */
export const requesting = ( state = {}, action ) => {
	switch ( action.type ) {
		case SITE_DOMAINS_REQUEST:
		case SITE_DOMAINS_REQUEST_SUCCESS:
		case SITE_DOMAINS_REQUEST_FAILURE:
			return Object.assign( {}, state, {
				[ action.siteId ]: action.type === SITE_DOMAINS_REQUEST,
			} );
	}

	return state;
};

/**
 * `Reducer` function which handles ERRORs REST-API response actions
 *
 * @param {object} state - current state
 * @param {object} action - domains action
 * @returns {object} updated state
 */
export const errors = ( state = {}, action ) => {
	switch ( action.type ) {
		case SITE_DOMAINS_REQUEST:
		case SITE_DOMAINS_REQUEST_SUCCESS:
			return Object.assign( {}, state, {
				[ action.siteId ]: null,
			} );

		case SITE_DOMAINS_REQUEST_FAILURE:
			return Object.assign( {}, state, {
				[ action.siteId ]: action.error,
			} );
	}

	return state;
};

export default combineReducers( {
	errors,
	items,
	requesting,
	updatingPrivacy,
} );
