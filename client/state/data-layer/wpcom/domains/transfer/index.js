/**
 * External dependencies
 */
import React from 'react';
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
	declineDomainTransferCompleted,
	fetchWapiDomainInfo,
	requestDomainTransferCodeCompleted,
	requestDomainTransferCodeFailed,
	updateDomainTransfer,
} from 'calypso/state/domains/transfer/actions';
import { CALYPSO_CONTACT } from 'calypso/lib/url/support';
import {
	DOMAIN_TRANSFER_ACCEPT,
	DOMAIN_TRANSFER_CANCEL_REQUEST,
	DOMAIN_TRANSFER_CODE_REQUEST,
	DOMAIN_TRANSFER_DECLINE,
	DOMAIN_TRANSFER_IPS_TAG_SAVE,
} from 'calypso/state/action-types';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';

import { registerHandlers } from 'calypso/state/data-layer/handler-registry';

const transferCodeErrorMessages = {
	unlock_domain_and_disable_private_reg_failed: translate(
		'The domain could not be unlocked. ' +
			'Additionally, Privacy Protection could not be disabled. ' +
			'The transfer will most likely fail due to these errors.'
	),
	unlock_domain_failed: translate(
		'The domain could not be unlocked. ' + 'The transfer will most likely fail due to this error.'
	),
	disable_private_reg_failed: translate(
		'Privacy Protection could not be disabled. ' +
			'The transfer will most likely fail due to this error.'
	),
};

const getDomainTransferCodeError = ( errorCode ) => {
	const contactLink = <a href={ CALYPSO_CONTACT } target="_blank" rel="noopener noreferrer" />;

	if ( errorCode && transferCodeErrorMessages.hasOwnProperty( errorCode ) ) {
		return errorNotice(
			translate(
				'An error occurred while trying to send the Domain Transfer code: {{strong}}%s{{/strong}} ' +
					'Please {{a}}Contact Support{{/a}}.',
				{
					args: transferCodeErrorMessages[ errorCode ],
					components: {
						strong: <strong />,
						a: contactLink,
					},
				}
			)
		);
	}

	return errorNotice(
		translate(
			'An error occurred while trying to send the Domain Transfer code. ' +
				'Please try again or {{a}}Contact Support{{/a}} if you continue ' +
				'to have trouble.',
			{
				components: {
					a: contactLink,
				},
			}
		)
	);
};

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

export const requestDomainTransferCodeSuccess = ( action ) => [
	requestDomainTransferCodeCompleted( action.domain, action.options ),
	fetchWapiDomainInfo( action.domain ),
];

export const requestDomainTransferCodeFailure = ( action, error ) => [
	requestDomainTransferCodeFailed( action.domain ),
	getDomainTransferCodeError( error.error ),
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
	successNotice(
		translate(
			'You have successfully cancelled your domain transfer. There is nothing else you need to do.'
		),
		{
			duration: 5000,
			id: `domain-transfer-notification-${ action.domain }`,
		}
	),
];

export const cancelDomainTransferRequestError = ( action, error ) => {
	const defaultMessage = translate(
		'An error occurred while canceling the domain transfer request.'
	);
	return errorNotice( error.message || defaultMessage, {
		duration: 5000,
		id: `domain-transfer-notification-${ action.domain }`,
	} );
};

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
		{
			duration: 5000,
			id: `domain-transfer-notification-${ action.domain }`,
		}
	),
];

export const acceptDomainTransferError = ( action, error ) => {
	const defaultMessage = translate( 'An error occurred while accepting the domain transfer.' );
	return errorNotice( error.message || defaultMessage, {
		duration: 5000,
		id: `domain-transfer-notification-${ action.domain }`,
	} );
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
