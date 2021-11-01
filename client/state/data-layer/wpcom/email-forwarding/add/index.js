import { translate } from 'i18n-calypso';
import page from 'page';
import { CALYPSO_CONTACT } from 'calypso/lib/url/support';
import { emailManagement } from 'calypso/my-sites/email/paths';
import { EMAIL_FORWARDING_ADD_REQUEST } from 'calypso/state/action-types';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import {
	receiveAddEmailForwardSuccess,
	receiveAddEmailForwardFailure,
} from 'calypso/state/email-forwarding/actions';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';

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
	const { domainName, mailbox, destination, siteSlug } = action;

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

		if ( siteSlug ) {
			page( emailManagement( siteSlug, domainName ) );
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
