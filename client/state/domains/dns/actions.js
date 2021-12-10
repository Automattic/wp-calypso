import wpcom from 'calypso/lib/wp';
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
	DOMAINS_DNS_UPDATE,
	DOMAINS_DNS_UPDATE_COMPLETED,
	DOMAINS_DNS_UPDATE_FAILED,
} from 'calypso/state/action-types';
import { getDomainDns } from './selectors';

import 'calypso/state/domains/init';

export const fetchDns = ( domainName, forceReload = false ) => ( dispatch, getState ) => {
	const dns = getDomainDns( getState(), domainName );

	if ( ! forceReload && ( dns.isFetching || dns.hasLoadedFromServer ) ) {
		return;
	}

	dispatch( { type: DOMAINS_DNS_FETCH, domainName } );

	wpcom.req
		.get( `/domains/${ domainName }/dns` )
		.then( ( { records } ) =>
			dispatch( { type: DOMAINS_DNS_FETCH_COMPLETED, domainName, records } )
		)
		.catch( () => dispatch( { type: DOMAINS_DNS_FETCH_FAILED, domainName } ) );
};

const updateDnsRequest = ( domainName, records ) =>
	wpcom.req.post( `/domains/${ domainName }/dns`, {
		dns: JSON.stringify( records ),
	} );

export const addDns = ( domainName, record ) => ( dispatch ) => {
	dispatch( { type: DOMAINS_DNS_ADD, domainName, record } );

	return updateDnsRequest( domainName, { records_to_add: [ record ] } )
		.then( ( { records } ) => dispatch( { type: DOMAINS_DNS_ADD_COMPLETED, domainName, records } ) )
		.catch( () => dispatch( { type: DOMAINS_DNS_ADD_FAILED, domainName, record } ) );
};

export const deleteDns = ( domainName, record ) => ( dispatch ) => {
	dispatch( { type: DOMAINS_DNS_DELETE, domainName, record } );

	return updateDnsRequest( domainName, { records_to_remove: [ record ] } )
		.then( ( { records } ) =>
			dispatch( { type: DOMAINS_DNS_DELETE_COMPLETED, domainName, records } )
		)
		.catch( () => dispatch( { type: DOMAINS_DNS_DELETE_FAILED, domainName, record } ) );
};

export const applyDnsTemplate = ( domainName, provider, service, variables ) => ( dispatch ) => {
	return wpcom.req
		.post( `/domains/${ domainName }/dns/providers/${ provider }/services/${ service }`, {
			variables,
		} )
		.then( ( { records } ) =>
			dispatch( { type: DOMAINS_DNS_APPLY_TEMPLATE_COMPLETED, records, domainName } )
		)
		.catch( () => {
			// swallow the error to avoid unhandled promise warnings. Caller will handle it.
		} );
};

export const updateDns = ( domainName, recordsToAdd, recordsToRemove ) => ( dispatch ) => {
	dispatch( { type: DOMAINS_DNS_UPDATE, recordsToAdd, recordsToRemove } );

	return updateDnsRequest( domainName, {
		records_to_add: recordsToAdd,
		records_to_remove: recordsToRemove,
	} )
		.then( ( { records } ) =>
			dispatch( { type: DOMAINS_DNS_UPDATE_COMPLETED, domainName, records } )
		)
		.catch( () => dispatch( { type: DOMAINS_DNS_UPDATE_FAILED, domainName } ) );
};
