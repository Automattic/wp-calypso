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
	receiveRemoveEmailForwardSuccess,
	receiveRemoveEmailForwardFailure,
} from 'state/email-forwarding/actions';

import { registerHandlers } from 'state/data-layer/handler-registry';

export const removeEmailForward = ( action ) => {
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

export const removeEmailForwardFailure = ( action, error ) => {
	const { domainName, mailbox } = action;

	let failureMessage = translate(
		'Failed to remove email forward %(email)s. ' +
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

	if ( error && error.message ) {
		failureMessage = translate(
			'Failed to remove email forward %(email)s ' +
				'with message "%(message)s". ' +
				'Please try again or ' +
				'{{contactSupportLink}}contact support{{/contactSupportLink}}.',
			{
				args: {
					message: error.message,
					email: mailbox + '@' + domainName,
				},
				components: {
					contactSupportLink: <a href={ CALYPSO_CONTACT } />,
				},
			}
		);
	}

	return [
		errorNotice( failureMessage ),
		receiveRemoveEmailForwardFailure( domainName, mailbox, error ),
	];
};

export const removeEmailForwardSuccess = ( action, response ) => {
	const { domainName, mailbox } = action;

	if ( response && response.deleted ) {
		const successMessage = translate( 'Email forward %(email)s has been successfully removed.', {
			args: {
				email: mailbox + '@' + domainName,
			},
		} );

		return [
			successNotice( successMessage, {
				duration: 5000,
			} ),
			receiveRemoveEmailForwardSuccess( domainName, mailbox ),
		];
	}

	return removeEmailForwardFailure( action, true );
};

registerHandlers( 'state/data-layer/wpcom/email-forwarding/remove/index.js', {
	[ EMAIL_FORWARDING_REMOVE_REQUEST ]: [
		dispatchRequest( {
			fetch: removeEmailForward,
			onSuccess: removeEmailForwardSuccess,
			onError: removeEmailForwardFailure,
		} ),
	],
} );
