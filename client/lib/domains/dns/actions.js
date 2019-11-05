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
import { isBeingProcessed } from '.';

export function fetchDns( domainName ) {
	const dns = DnsStore.getByDomainName( domainName );

	if ( dns.isFetching || dns.hasLoadedFromServer ) {
		return;
	}

	Dispatcher.handleViewAction( {
		type: DNS_FETCH,
		domainName,
	} );

	wpcom.undocumented().fetchDns( domainName, ( error, data ) => {
		if ( ! error ) {
			Dispatcher.handleServerAction( {
				type: DNS_FETCH_COMPLETED,
				records: data && data.records,
				domainName,
			} );
		} else {
			Dispatcher.handleServerAction( {
				type: DNS_FETCH_FAILED,
				domainName,
			} );
		}
	} );
}

export function addDns( domainName, record, onComplete ) {
	Dispatcher.handleServerAction( {
		type: DNS_ADD,
		domainName,
		record,
	} );

	const dns = DnsStore.getByDomainName( domainName );

	wpcom.undocumented().updateDns( domainName, dns.records, error => {
		const type = ! error ? DNS_ADD_COMPLETED : DNS_ADD_FAILED;
		Dispatcher.handleServerAction( {
			type,
			domainName,
			record,
		} );

		onComplete( error );
	} );
}

export function deleteDns( domainName, record, onComplete ) {
	if ( isBeingProcessed( record ) ) {
		return;
	}

	Dispatcher.handleServerAction( {
		type: DNS_DELETE,
		domainName,
		record,
	} );

	const dns = DnsStore.getByDomainName( domainName );

	wpcom.undocumented().updateDns( domainName, dns.records, error => {
		const type = ! error ? DNS_DELETE_COMPLETED : DNS_DELETE_FAILED;

		Dispatcher.handleServerAction( {
			type,
			domainName,
			record,
		} );

		onComplete( error );
	} );
}

export function applyDnsTemplate( domainName, provider, service, variables, onComplete ) {
	wpcom
		.undocumented()
		.applyDnsTemplate( domainName, provider, service, variables, ( error, data ) => {
			if ( ! error ) {
				Dispatcher.handleServerAction( {
					type: DNS_APPLY_TEMPLATE_COMPLETED,
					records: data && data.records,
					domainName,
				} );
			}
			onComplete( error );
		} );
}
