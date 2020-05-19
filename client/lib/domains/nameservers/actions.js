/**
 * Internal dependencies
 */
import Dispatcher from 'dispatcher';
import wpcom from 'lib/wp';
import {
	NAMESERVERS_FETCH,
	NAMESERVERS_FETCH_COMPLETED,
	NAMESERVERS_FETCH_FAILED,
	NAMESERVERS_UPDATE_COMPLETED,
} from './action-types';
import NameserversStore from './store';

export function fetchNameservers( domainName ) {
	const nameservers = NameserversStore.getByDomainName( domainName );

	if ( nameservers.isFetching || nameservers.hasLoadedFromServer ) {
		return;
	}

	Dispatcher.handleViewAction( {
		type: NAMESERVERS_FETCH,
		domainName,
	} );

	wpcom.undocumented().nameservers( domainName, ( error, data ) => {
		if ( error ) {
			Dispatcher.handleServerAction( {
				type: NAMESERVERS_FETCH_FAILED,
				domainName,
			} );
		} else {
			Dispatcher.handleServerAction( {
				type: NAMESERVERS_FETCH_COMPLETED,
				domainName,
				nameservers: data,
			} );
		}
	} );
}

export function updateNameservers( domainName, nameservers, onComplete ) {
	const postData = nameservers.map( ( nameserver ) => ( { nameserver } ) );

	wpcom.undocumented().updateNameservers( domainName, { nameservers: postData }, ( error ) => {
		if ( ! error ) {
			Dispatcher.handleServerAction( {
				type: NAMESERVERS_UPDATE_COMPLETED,
				domainName,
				nameservers,
			} );
		}

		onComplete( error );
	} );
}
