/**
 * Internal dependencies
 */
import Dispatcher from 'dispatcher';
import wpcom from 'lib/wp';
import {
	DOMAIN_TRANSFER_ACCEPT_COMPLETED,
	DOMAIN_TRANSFER_CANCEL_REQUEST_COMPLETED,
	DOMAIN_TRANSFER_CODE_REQUEST_COMPLETED,
	DOMAIN_TRANSFER_DECLINE_COMPLETED,
	PRIVACY_PROTECTION_ENABLE_COMPLETED,
	WAPI_DOMAIN_INFO_FETCH,
	WAPI_DOMAIN_INFO_FETCH_COMPLETED,
	WAPI_DOMAIN_INFO_FETCH_FAILED,
} from './action-types';
import wapiDomainInfoAssembler from './assembler';
import WapiDomainInfoStore from './store';

export function requestTransferCode( options, onComplete ) {
	const { siteId, domainName, unlock, disablePrivacy } = options;

	wpcom.undocumented().requestTransferCode( options, ( error ) => {
		if ( error ) {
			onComplete( error );
			return;
		}

		Dispatcher.handleServerAction( {
			type: DOMAIN_TRANSFER_CODE_REQUEST_COMPLETED,
			siteId,
			domainName,
			unlock,
			disablePrivacy,
		} );

		onComplete( null );
	} );
}

export function cancelTransferRequest( options, onComplete ) {
	wpcom.undocumented().cancelTransferRequest( options, ( error ) => {
		if ( error ) {
			onComplete( error );
			return;
		}

		Dispatcher.handleServerAction( {
			type: DOMAIN_TRANSFER_CANCEL_REQUEST_COMPLETED,
			domainName: options.domainName,
			locked: options.lockDomain,
		} );

		if ( options.enablePrivacy ) {
			Dispatcher.handleServerAction( {
				type: PRIVACY_PROTECTION_ENABLE_COMPLETED,
				siteId: options.siteId,
				domainName: options.domainName,
			} );
		}

		onComplete( null );
	} );
}

export function acceptTransfer( domainName, onComplete ) {
	wpcom.undocumented().acceptTransfer( domainName, ( error ) => {
		if ( error ) {
			onComplete( error );
			return;
		}

		Dispatcher.handleServerAction( {
			type: DOMAIN_TRANSFER_ACCEPT_COMPLETED,
			domainName,
		} );

		onComplete( null );
	} );
}

export function declineTransfer( domainName, onComplete ) {
	wpcom.undocumented().declineTransfer( domainName, ( error ) => {
		if ( error ) {
			onComplete( error );
			return;
		}

		Dispatcher.handleServerAction( {
			type: DOMAIN_TRANSFER_DECLINE_COMPLETED,
			domainName,
		} );

		onComplete( null );
	} );
}

export function enablePrivacyProtection( domainName, onComplete ) {
	wpcom.undocumented().enablePrivacyProtection( domainName, ( error ) => {
		if ( error ) {
			onComplete( error );
			return;
		}

		Dispatcher.handleServerAction( {
			type: PRIVACY_PROTECTION_ENABLE_COMPLETED,
			domainName,
		} );

		onComplete( null );
	} );
}

export function disablePrivacyProtection( domainName, onComplete ) {
	wpcom.undocumented().disablePrivacyProtection( domainName, ( error ) => {
		if ( error ) {
			onComplete( error );
			return;
		}

		onComplete( null );
	} );
}

export function fetchWapiDomainInfo( domainName ) {
	const wapiDomainInfo = WapiDomainInfoStore.getByDomainName( domainName );

	if ( ! wapiDomainInfo.needsUpdate ) {
		return;
	}

	Dispatcher.handleViewAction( {
		type: WAPI_DOMAIN_INFO_FETCH,
		domainName,
	} );

	wpcom.undocumented().fetchWapiDomainInfo( domainName, ( error, status ) => {
		if ( error ) {
			Dispatcher.handleServerAction( {
				type: WAPI_DOMAIN_INFO_FETCH_FAILED,
				error,
				domainName,
			} );

			return;
		}

		Dispatcher.handleServerAction( {
			type: WAPI_DOMAIN_INFO_FETCH_COMPLETED,
			status: wapiDomainInfoAssembler.createDomainObject( status ),
			domainName,
		} );
	} );
}
