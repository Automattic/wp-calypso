/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import {
	DOMAINS_DNS_ADD,
	DOMAINS_DNS_ADD_COMPLETED,
	DOMAINS_DNS_ADD_FAILED,
	DOMAINS_DNS_APPLY_TEMPLATE_COMPLETED,
	DOMAINS_DNS_DELETE,
	DOMAINS_DNS_DELETE_COMPLETED,
	DOMAINS_DNS_DELETE_FAILED,
	DOMAINS_DNS_FETCH,
	DOMAINS_DNS_FETCH_COMPLETED,
	DOMAINS_DNS_FETCH_FAILED,
} from 'state/action-types';
import { getDomainDns } from './selectors';

export const fetchDns = ( domainName ) => ( dispatch, getState ) => {
	const dns = getDomainDns( getState(), domainName );

	if ( dns.isFetching || dns.hasLoadedFromServer ) {
		return;
	}

	dispatch( { type: DOMAINS_DNS_FETCH, domainName } );

	wpcom
		.undocumented()
		.fetchDns( domainName )
		.then(
			( { records } ) => dispatch( { type: DOMAINS_DNS_FETCH_COMPLETED, domainName, records } ),
			() => dispatch( { type: DOMAINS_DNS_FETCH_FAILED, domainName } )
		);
};

export const addDns = ( domainName, record ) => ( dispatch, getState ) => {
	dispatch( { type: DOMAINS_DNS_ADD, domainName, record } );

	const dns = getDomainDns( getState(), domainName );

	const addResult = wpcom.undocumented().updateDns( domainName, dns.records );

	addResult.then(
		() => dispatch( { type: DOMAINS_DNS_ADD_COMPLETED, domainName, record } ),
		() => dispatch( { type: DOMAINS_DNS_ADD_FAILED, domainName, record } )
	);

	return addResult;
};

export const deleteDns = ( domainName, record ) => ( dispatch, getState ) => {
	dispatch( { type: DOMAINS_DNS_DELETE, domainName, record } );

	const dns = getDomainDns( getState(), domainName );

	const updateResult = wpcom.undocumented().updateDns( domainName, dns.records );

	updateResult.then(
		() => dispatch( { type: DOMAINS_DNS_DELETE_COMPLETED, domainName, record } ),
		() => dispatch( { type: DOMAINS_DNS_DELETE_FAILED, domainName, record } )
	);

	return updateResult;
};

export const applyDnsTemplate = ( domainName, provider, service, variables ) => ( dispatch ) => {
	const applyResult = wpcom
		.undocumented()
		.applyDnsTemplate( domainName, provider, service, variables );

	applyResult.then(
		( { records } ) =>
			dispatch( { type: DOMAINS_DNS_APPLY_TEMPLATE_COMPLETED, records, domainName } ),
		() => {} // swallow the error to avoid unhandled promise warnings. Caller will handle it.
	);

	return applyResult;
};
