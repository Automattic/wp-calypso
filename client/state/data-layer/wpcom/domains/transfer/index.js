/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import {
	acceptDomainTransferCompleted,
	cancelDomainTransferRequestCompleted,
	cancelDomainTransferRequestFailed,
	declineDomainTransferCompleted,
	fetchWapiDomainInfo,
	requestDomainTransferCodeCompleted,
	requestDomainTransferCodeFailed,
	updateDomainTransfer,
} from 'calypso/state/domains/transfer/actions';
import {
	DOMAIN_TRANSFER_ACCEPT,
	DOMAIN_TRANSFER_CANCEL_REQUEST,
	DOMAIN_TRANSFER_CODE_REQUEST,
	DOMAIN_TRANSFER_DECLINE,
	DOMAIN_TRANSFER_IPS_TAG_SAVE,
} from 'calypso/state/action-types';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { getDomainWapiInfoByDomainName } from 'calypso/state/domains/transfer/selectors';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import {
	getCancelTransferErrorMessage,
	getCancelTransferSuccessMessage,
	getDomainTransferCodeError,
	getNoticeOptions,
} from './notices';

/**
 * Generates actions to save the domain IPS tag at OpenSRS
 * and notify the front end save is in progress (for dialog
 * submit button management).
 *
 * @param 	{string} action saveDomainIpsTag action
 * @returns {Array} array of further actions
 */
export const saveDomainIpsTag = ( action ) => {
	const { domain, ipsTag } = action;

	return [
		updateDomainTransfer( domain, { saveStatus: 'saving' } ),
		http(
			{
				apiVersion: '1',
				method: 'POST',
				path: '/domains/' + domain + '/transfer/',
				body: {
					domainStatus: JSON.stringify( {
						command: 'set-ips-tag',
						payload: { ips_tag: ipsTag },
					} ),
				},
			},
			action
		),
	];
};

export const handleIpsTagSaveSuccess = ( { domain, selectedRegistrar } ) =>
	updateDomainTransfer( domain, { selectedRegistrar, saveStatus: 'success' } );

export const handleIpsTagSaveFailure = ( { domain, selectedRegistrar } ) => [
	updateDomainTransfer( domain, { selectedRegistrar, saveStatus: 'error' } ),
	errorNotice( translate( 'IPS tag save failed!' ), {
		duration: 20000,
		id: 'ips-tag-save-failure-notice',
		isPersistent: true,
		href: 'https://wordpress.com/help/contact',
		button: 'Get Help',
		showDismiss: false,
	} ),
];

export const requestDomainTransferCode = ( action ) =>
	http(
		{
			apiVersion: '1.1',
			method: 'POST',
			path: '/domains/' + action.domain + '/transfer/',
			body: {
				domainStatus: JSON.stringify( {
					command: 'send-code',
				} ),
			},
		},
		action
	);

export const requestDomainTransferCodeSuccess = ( action ) => ( dispatch, getState ) => {
	const domainInfo = getDomainWapiInfoByDomainName( getState(), action.domain );

	dispatch( requestDomainTransferCodeCompleted( action.domain, action.options ) );

	dispatch( fetchWapiDomainInfo( action.domain ) );

	if ( domainInfo.manualTransferRequired ) {
		dispatch(
			successNotice(
				translate(
					'The registry for your domain requires a special process for transfers. ' +
						'Our Happiness Engineers have been notified about your transfer request and will be in touch ' +
						'shortly to help you complete the process.'
				),
				getNoticeOptions( action.domain )
			)
		);
		return;
	}

	dispatch(
		successNotice(
			translate(
				"We have sent the transfer authorization code to the domain registrant's email address. " +
					"If you don't receive the email shortly, please check your spam folder."
			),
			getNoticeOptions( action.domain )
		)
	);
};

export const requestDomainTransferCodeFailure = ( action, error ) => [
	requestDomainTransferCodeFailed( action.domain ),
	errorNotice( getDomainTransferCodeError( error.error ), getNoticeOptions( action.domain ) ),
	fetchWapiDomainInfo( action.domain ),
];

export const cancelDomainTransferRequest = ( action ) =>
	http(
		{
			apiVersion: '1.1',
			method: 'POST',
			path: '/domains/' + action.domain + '/transfer/',
			body: {
				domainStatus: JSON.stringify( {
					command: 'cancel-transfer-request',
					payload: {
						decline_transfer: action.options.declineTransfer,
					},
				} ),
			},
		},
		action
	);

export const cancelDomainTransferRequestSuccess = ( action ) => [
	cancelDomainTransferRequestCompleted( action.domain, action.options ),
	fetchWapiDomainInfo( action.domain ),
	successNotice(
		getCancelTransferSuccessMessage( action.options ),
		getNoticeOptions( action.domain )
	),
];

export const cancelDomainTransferRequestError = ( action, error ) => [
	cancelDomainTransferRequestFailed( action.domain ),
	errorNotice( getCancelTransferErrorMessage( error.error ), getNoticeOptions( action.domain ) ),
];

export const acceptDomainTransfer = ( action ) =>
	http(
		{
			apiVersion: '1.1',
			method: 'POST',
			path: '/domains/' + action.domain + '/transfer/',
			body: {
				domainStatus: JSON.stringify( {
					command: 'accept-transfer',
				} ),
			},
		},
		action
	);

export const acceptDomainTransferSuccess = ( action ) => [
	acceptDomainTransferCompleted( action.domain ),
	successNotice(
		translate(
			'You have successfully expedited your domain transfer. There is nothing else you need to do.'
		),
		getNoticeOptions( action.domain )
	),
];

export const acceptDomainTransferError = ( action, error ) => {
	const defaultMessage = translate( 'An error occurred while accepting the domain transfer.' );
	return errorNotice( error.message || defaultMessage, getNoticeOptions( action.domain ) );
};

export const declineDomainTransfer = ( action ) =>
	http(
		{
			apiVersion: '1.1',
			method: 'POST',
			path: '/domains/' + action.domain + '/transfer/',
			body: {
				domainStatus: JSON.stringify( {
					command: 'deny-transfer',
				} ),
			},
		},
		action
	);

export const declineDomainTransferSuccess = ( action ) => [
	declineDomainTransferCompleted( action.domain ),
];

registerHandlers( 'state/data-layer/wpcom/domains/transfer/index.js', {
	[ DOMAIN_TRANSFER_IPS_TAG_SAVE ]: [
		dispatchRequest( {
			fetch: saveDomainIpsTag,
			onSuccess: handleIpsTagSaveSuccess,
			onError: handleIpsTagSaveFailure,
		} ),
	],
	[ DOMAIN_TRANSFER_CODE_REQUEST ]: [
		dispatchRequest( {
			fetch: requestDomainTransferCode,
			onSuccess: requestDomainTransferCodeSuccess,
			onError: requestDomainTransferCodeFailure,
		} ),
	],
	[ DOMAIN_TRANSFER_CANCEL_REQUEST ]: [
		dispatchRequest( {
			fetch: cancelDomainTransferRequest,
			onSuccess: cancelDomainTransferRequestSuccess,
			onError: cancelDomainTransferRequestError,
		} ),
	],
	[ DOMAIN_TRANSFER_ACCEPT ]: [
		dispatchRequest( {
			fetch: acceptDomainTransfer,
			onSuccess: acceptDomainTransferSuccess,
			onError: acceptDomainTransferError,
		} ),
	],
	[ DOMAIN_TRANSFER_DECLINE ]: [
		dispatchRequest( {
			fetch: declineDomainTransfer,
			onSuccess: declineDomainTransferSuccess,
			onError: noop,
		} ),
	],
} );
