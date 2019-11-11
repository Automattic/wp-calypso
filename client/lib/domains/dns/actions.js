/**
 * Internal dependencies
 */
import Dispatcher from 'dispatcher';
import wpcom from 'lib/wp';
import {
	DNS_ADD,
	DNS_ADD_COMPLETED,
	DNS_ADD_FAILED,
	DNS_APPLY_TEMPLATE_COMPLETED,
	DNS_DELETE,
	DNS_DELETE_COMPLETED,
	DNS_DELETE_FAILED,
	DNS_FETCH,
	DNS_FETCH_COMPLETED,
	DNS_FETCH_FAILED,
} from './action-types';
import DnsStore from './store';

export function fetchDns( domainName ) {
	const dns = DnsStore.getByDomainName( domainName );

	if ( dns.isFetching || dns.hasLoadedFromServer ) {
		return;
	}

	Dispatcher.handleViewAction( {
		type: DNS_FETCH,
		domainName,
	} );

	wpcom
		.undocumented()
		.fetchDns( domainName )
		.then(
			data => {
				Dispatcher.handleServerAction( {
					type: DNS_FETCH_COMPLETED,
					records: data && data.records,
					domainName,
				} );
			},
			() => {
				Dispatcher.handleServerAction( {
					type: DNS_FETCH_FAILED,
					domainName,
				} );
			}
		);
}

export function addDns( domainName, record ) {
	Dispatcher.handleServerAction( {
		type: DNS_ADD,
		domainName,
		record,
	} );

	const dns = DnsStore.getByDomainName( domainName );

	const addResult = wpcom.undocumented().updateDns( domainName, dns.records );
	addResult.then(
		() => {
			Dispatcher.handleServerAction( {
				type: DNS_ADD_COMPLETED,
				domainName,
				record,
			} );
		},
		() => {
			Dispatcher.handleServerAction( {
				type: DNS_ADD_FAILED,
				domainName,
				record,
			} );
		}
	);

	return addResult;
}

export function deleteDns( domainName, record ) {
	Dispatcher.handleServerAction( {
		type: DNS_DELETE,
		domainName,
		record,
	} );

	const dns = DnsStore.getByDomainName( domainName );

	const updateResult = wpcom.undocumented().updateDns( domainName, dns.records );
	updateResult.then(
		() => {
			Dispatcher.handleServerAction( {
				type: DNS_DELETE_COMPLETED,
				domainName,
				record,
			} );
		},
		() => {
			Dispatcher.handleServerAction( {
				type: DNS_DELETE_FAILED,
				domainName,
				record,
			} );
		}
	);

	return updateResult;
}

export function applyDnsTemplate( domainName, provider, service, variables ) {
	const applyResult = wpcom
		.undocumented()
		.applyDnsTemplate( domainName, provider, service, variables );
	applyResult.then(
		data => {
			Dispatcher.handleServerAction( {
				type: DNS_APPLY_TEMPLATE_COMPLETED,
				records: data && data.records,
				domainName,
			} );
		},
		() => {} // swallow the error to avoid unhandled promise warnings. Caller will handle it.
	);

	return applyResult;
}
