/**
 * Internal dependencies
 */
import {
	DOMAIN_NAMESERVERS_FETCH,
	DOMAIN_NAMESERVERS_FETCH_SUCCESS,
	DOMAIN_NAMESERVERS_FETCH_FAILURE,
	DOMAIN_NAMESERVERS_UPDATE,
	DOMAIN_NAMESERVERS_UPDATE_SUCCESS,
} from 'calypso/state/action-types';

import 'calypso/state/data-layer/wpcom/domains/nameservers/index.js';
import 'calypso/state/domains/init';

export function fetchNameservers( domainName ) {
	return {
		type: DOMAIN_NAMESERVERS_FETCH,
		domainName,
	};
}

export function fetchNameserversSuccess( domainName, nameservers ) {
	return {
		type: DOMAIN_NAMESERVERS_FETCH_SUCCESS,
		domainName,
		nameservers,
	};
}

export function fetchNameserversFailure( domainName ) {
	return {
		type: DOMAIN_NAMESERVERS_FETCH_FAILURE,
		domainName,
	};
}

export function updateNameservers( domainName, nameservers ) {
	return {
		type: DOMAIN_NAMESERVERS_UPDATE,
		domainName,
		nameservers,
	};
}

export function updateNameserversSuccess( domainName, nameservers ) {
	return {
		type: DOMAIN_NAMESERVERS_UPDATE_SUCCESS,
		domainName,
		nameservers,
	};
}
