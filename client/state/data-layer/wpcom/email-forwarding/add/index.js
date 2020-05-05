/**
 * External Dependencies
 */
import React from 'react';
import { translate } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import { CALYPSO_CONTACT } from 'lib/url/support';
import { EMAIL_FORWARDING_ADD_REQUEST } from 'state/action-types';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { errorNotice, successNotice } from 'state/notices/actions';
import {
	receiveAddEmailForwardSuccess,
	receiveAddEmailForwardFailure,
} from 'state/email-forwarding/actions';

import { registerHandlers } from 'state/data-layer/handler-registry';

export const addEmailForward = ( action ) => {
	return http(
		{
			method: 'POST',
			path: `/domains/${ encodeURIComponent( action.domainName ) }/email/new`,
			body: {
				mailbox: action.mailbox,
				destination: action.destination,
			},
		},
		action
	);
};

export const addEmailForwardFailure = ( action, error ) => {
	const { domainName, mailbox, destination } = action;

	let failureMessage = translate(
		'Failed to add email forwarding record. ' +
			'Please try again or ' +
			'{{contactSupportLink}}contact support{{/contactSupportLink}}.',
		{
			components: {
				contactSupportLink: <a href={ CALYPSO_CONTACT } />,
			},
		}
	);

	if ( error && error.message ) {
		failureMessage = translate(
			'Failed to add email forwarding record ' +
				'with message "%(message)s". ' +
				'Please try again or ' +
				'{{contactSupportLink}}contact support{{/contactSupportLink}}.',
			{
				args: {
					message: error.message,
				},
				components: {
					contactSupportLink: <a href={ CALYPSO_CONTACT } />,
				},
			}
		);
	}

	return [
		errorNotice( failureMessage ),
		receiveAddEmailForwardFailure( domainName, mailbox, destination, error ),
	];
};

export const addEmailForwardSuccess = ( action, response ) => {
	const { domainName, mailbox, destination } = action;

	if ( response && response.created ) {
		let successMessage = translate( '%(email)s has been successfully added!', {
			args: {
				email: mailbox + '@' + domainName,
			},
		} );

		if ( ! response.verified ) {
			successMessage = translate(
				'%(email)s has been successfully added! ' +
					'You must confirm your email before it starts working. ' +
					'Please check your inbox for %(destination)s.',
				{
					args: {
						email: mailbox + '@' + domainName,
						destination: destination,
					},
				}
			);
		}

		return [
			successNotice( successMessage, {
				duration: 5000,
			} ),
			receiveAddEmailForwardSuccess( domainName, mailbox, response.verified ),
		];
	}

	return addEmailForwardFailure( action, true );
};

registerHandlers( 'state/data-layer/wpcom/email-forwarding/create/index.js', {
	[ EMAIL_FORWARDING_ADD_REQUEST ]: [
		dispatchRequest( {
			fetch: addEmailForward,
			onSuccess: addEmailForwardSuccess,
			onError: addEmailForwardFailure,
		} ),
	],
} );
