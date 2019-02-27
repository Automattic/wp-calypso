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
import { EMAIL_FORWARDING_RESEND_VERIFICATION_REQUEST } from 'state/action-types';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { errorNotice, successNotice } from 'state/notices/actions';
import {
	receiveResendVerificationEmailSuccess,
	receiveResendVerificationEmailFailure,
} from 'state/email-forwarding/actions';

import { registerHandlers } from 'state/data-layer/handler-registry';

export const requestResendEmailVerification = action => {
	const { domainName, mailbox } = action;

	return http(
		{
			method: 'POST',
			path: `/domains/${ encodeURIComponent( domainName ) }/email/${ encodeURIComponent(
				mailbox
			) }/resend-verification`,
			body: {},
		},
		action
	);
};

export const resendEmailVerificationSuccess = ( action, response ) => {
	const { domainName, mailbox, destination } = action;
	const actions = [];

	if ( response ) {
		const successMessage = translate(
			'successfully sent confirmation email for %(email)s to %(destination)s!',
			{
				args: {
					email: mailbox + '@' + domainName,
					destination,
				},
			}
		);

		actions.push(
			successNotice( successMessage, {
				duration: 5000,
			} )
		);

		actions.push( receiveResendVerificationEmailSuccess( domainName, mailbox, response ) );
	}

	return actions;
};

export const resendEmailVerificationError = ( action, response ) => {
	const { domainName, mailbox, destination } = action;
	const actions = [];

	if ( response ) {
		const failureMessage = translate(
			'Failed to resend verification email for email forwarding record %(email)s. Please try again or {{contactSupportLink}}contact support{{/contactSupportLink}}.',
			{
				args: {
					email: mailbox + '@' + domainName,
				},
				components: {
					contactSupportLink: <a href={ CALYPSO_CONTACT } />,
				},
			}
		);

		actions.push( errorNotice( failureMessage ) );
		actions.push(
			receiveResendVerificationEmailFailure( domainName, mailbox, destination, response )
		);
	}

	return actions;
};

registerHandlers( 'state/data-layer/wpcom/email-forwarding/resend-email-verification/index.js', {
	[ EMAIL_FORWARDING_RESEND_VERIFICATION_REQUEST ]: [
		dispatchRequest( {
			fetch: requestResendEmailVerification,
			onSuccess: resendEmailVerificationSuccess,
			onError: resendEmailVerificationError,
		} ),
	],
} );
