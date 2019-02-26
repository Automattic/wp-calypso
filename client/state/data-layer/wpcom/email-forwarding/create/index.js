/** @format */
/**
 * External Dependencies
 */
import React from 'react';
import { translate } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import { CALYPSO_CONTACT } from 'lib/url/support';
import { EMAIL_FORWARDING_CREATE_REQUEST } from 'state/action-types';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { errorNotice, successNotice } from 'state/notices/actions';
import {
	receiveCreateEmailForwardingSuccess,
	receiveCreateEmailForwardingFailure,
} from 'state/email-forwarding/actions';

import { registerHandlers } from 'state/data-layer/handler-registry';

export const requestNewEmailForward = action => {
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

export const newForwardSuccess = ( action, response ) => {
	const { domainName, mailbox, destination } = action;
	const actions = [];

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

		actions.push(
			successNotice( successMessage, {
				duration: 5000,
			} )
		);

		actions.push( receiveCreateEmailForwardingSuccess( domainName, mailbox, response.verified ) );
	}

	return actions;
};

export function newForwardError( action, response ) {
	const { domainName, mailbox, destination } = action;
	const actions = [];

	if ( response ) {
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

		if ( response.message ) {
			failureMessage = translate(
				'Failed to add email forwarding record ' +
					'with message "%(message)s".' +
					'Please try again or ' +
					'{{contactSupportLink}}contact support{{/contactSupportLink}}.',
				{
					args: {
						message: response.message,
					},
					components: {
						contactSupportLink: <a href={ CALYPSO_CONTACT } />,
					},
				}
			);
		}

		actions.push( errorNotice( failureMessage ) );
		actions.push(
			receiveCreateEmailForwardingFailure( domainName, mailbox, destination, response )
		);
	}

	return actions;
}

registerHandlers( 'state/data-layer/wpcom/email-forwading/new/index.js', {
	[ EMAIL_FORWARDING_CREATE_REQUEST ]: [
		dispatchRequest( {
			fetch: requestNewEmailForward,
			onSuccess: newForwardSuccess,
			onError: newForwardError,
		} ),
	],
} );
