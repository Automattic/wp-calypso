/**
 * Internal dependencies
 */
import {
	DOMAIN_NAMESERVERS_FETCH,
	DOMAIN_NAMESERVERS_FETCH_FAILURE,
	DOMAIN_NAMESERVERS_RECEIVE,
	DOMAIN_NAMESERVERS_UPDATE,
} from 'calypso/state/action-types';

import 'calypso/state/data-layer/wpcom/domains/nameservers/index.js';
import 'calypso/state/domains/init';

export function fetchNameservers( domainName ) {
	return {
		type: DOMAIN_NAMESERVERS_FETCH,
		domainName,
	};
}

export function receiveNameservers( domainName, nameservers ) {
	return {
		type: DOMAIN_NAMESERVERS_RECEIVE,
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
