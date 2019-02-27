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
import { EMAIL_FORWARDING_REMOVE_REQUEST } from 'state/action-types';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { errorNotice, successNotice } from 'state/notices/actions';
import {
	receiveRemoveEmailForwardingSuccess,
	receiveRemoveEmailForwardingFailure,
} from 'state/email-forwarding/actions';

import { registerHandlers } from 'state/data-layer/handler-registry';

export const removeEmailForward = action => {
	return http(
		{
			method: 'POST',
			path: `/domains/${ encodeURIComponent( action.domainName ) }/email/${ encodeURIComponent(
				action.mailbox
			) }/delete`,
			body: {},
		},
		action
	);
};

export const removeEmailForwardSuccess = ( action, response ) => {
	const { domainName, mailbox } = action;
	const actions = [];

	if ( response ) {
		const successMessage = translate( 'Email forwarding %(email)s has been successfully removed.', {
			args: {
				email: mailbox + '@' + domainName,
			},
		} );

		actions.push(
			successNotice( successMessage, {
				duration: 5000,
			} )
		);

		actions.push( receiveRemoveEmailForwardingSuccess( domainName, mailbox, response ) );
	}

	return actions;
};

export function removeEmailForwardError( action, response ) {
	const { domainName, mailbox } = action;
	const actions = [];

	if ( response ) {
		let failureMessage = translate(
			'Failed to remove email forwarding record %(email)s. ' +
				'Please try again or ' +
				'{{contactSupportLink}}contact support{{/contactSupportLink}}.',
			{
				args: {
					email: mailbox + '@' + domainName,
				},
				components: {
					contactSupportLink: <a href={ CALYPSO_CONTACT } />,
				},
			}
		);

		if ( response.message ) {
			failureMessage = translate(
				'Failed to remove email forwarding record %(email)s' +
					'with message "%(message)s".' +
					'Please try again or ' +
					'{{contactSupportLink}}contact support{{/contactSupportLink}}.',
				{
					args: {
						message: response.message,
						email: mailbox + '@' + domainName,
					},
					components: {
						contactSupportLink: <a href={ CALYPSO_CONTACT } />,
					},
				}
			);
		}

		actions.push( errorNotice( failureMessage ) );
		actions.push( receiveRemoveEmailForwardingFailure( domainName, mailbox, response ) );
	}

	return actions;
}

registerHandlers( 'state/data-layer/wpcom/email-forwarding/remove/index.js', {
	[ EMAIL_FORWARDING_REMOVE_REQUEST ]: [
		dispatchRequest( {
			fetch: removeEmailForward,
			onSuccess: removeEmailForwardSuccess,
			onError: removeEmailForwardError,
		} ),
	],
} );
