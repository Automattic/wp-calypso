/**
 * Internal dependencies
 */
import {
	DOMAIN_TRANSFER_ACCEPT,
	DOMAIN_TRANSFER_ACCEPT_COMPLETED,
	DOMAIN_TRANSFER_CANCEL_REQUEST,
	DOMAIN_TRANSFER_CANCEL_REQUEST_COMPLETED,
	DOMAIN_TRANSFER_CANCEL_REQUEST_FAILED,
	DOMAIN_TRANSFER_CODE_REQUEST,
	DOMAIN_TRANSFER_CODE_REQUEST_COMPLETED,
	DOMAIN_TRANSFER_CODE_REQUEST_FAILED,
	DOMAIN_TRANSFER_DECLINE,
	DOMAIN_TRANSFER_DECLINE_COMPLETED,
	DOMAIN_TRANSFER_IPS_TAG_SAVE,
	DOMAIN_TRANSFER_UPDATE,
	DOMAIN_WAPI_INFO_FETCH,
	DOMAIN_WAPI_INFO_FETCH_FAILURE,
	DOMAIN_WAPI_INFO_FETCH_SUCCESS,
} from 'calypso/state/action-types';
import { createDomainObject } from './assembler';

import 'calypso/state/data-layer/wpcom/domains/transfer/index.js';
import 'calypso/state/data-layer/wpcom/domains/status/index.js';
import 'calypso/state/domains/init';

export const saveDomainIpsTag = ( domain, selectedRegistrar ) => ( {
	type: DOMAIN_TRANSFER_IPS_TAG_SAVE,
	domain,
	ipsTag: selectedRegistrar.tag,
	selectedRegistrar,
} );

export const updateDomainTransfer = ( domain, options ) => ( {
	type: DOMAIN_TRANSFER_UPDATE,
	domain,
	options,
} );

export const requestDomainTransferCode = ( domain, options ) => ( {
	type: DOMAIN_TRANSFER_CODE_REQUEST,
	domain,
	options,
} );

export const requestDomainTransferCodeCompleted = ( domain, options ) => ( {
	type: DOMAIN_TRANSFER_CODE_REQUEST_COMPLETED,
	domain,
	options,
} );

export const requestDomainTransferCodeFailed = ( domain ) => ( {
	type: DOMAIN_TRANSFER_CODE_REQUEST_FAILED,
	domain,
} );

export const cancelDomainTransferRequest = ( domain, options ) => ( {
	type: DOMAIN_TRANSFER_CANCEL_REQUEST,
	domain,
	options,
} );

export const cancelDomainTransferRequestCompleted = ( domain, options ) => ( {
	type: DOMAIN_TRANSFER_CANCEL_REQUEST_COMPLETED,
	domain,
	options,
} );

export const cancelDomainTransferRequestFailed = ( domain ) => ( {
	type: DOMAIN_TRANSFER_CANCEL_REQUEST_FAILED,
	domain,
} );

export const acceptDomainTransfer = ( domain ) => ( {
	type: DOMAIN_TRANSFER_ACCEPT,
	domain,
} );

export const acceptDomainTransferCompleted = ( domain ) => ( {
	type: DOMAIN_TRANSFER_ACCEPT_COMPLETED,
	domain,
} );

export const declineDomainTransfer = ( domain ) => ( {
	type: DOMAIN_TRANSFER_DECLINE,
	domain,
} );

export const declineDomainTransferCompleted = ( domain ) => ( {
	type: DOMAIN_TRANSFER_DECLINE_COMPLETED,
	domain,
} );

export const fetchWapiDomainInfo = ( domain ) => ( {
	type: DOMAIN_WAPI_INFO_FETCH,
	domain,
} );

export const fetchWapiDomainInfoSuccess = ( domain, status ) => ( {
	type: DOMAIN_WAPI_INFO_FETCH_SUCCESS,
	domain,
	status: createDomainObject( status ),
} );

export const fetchWapiDomainInfoFailure = ( domain, error ) => ( {
	type: DOMAIN_WAPI_INFO_FETCH_FAILURE,
	domain,
	error,
} );
