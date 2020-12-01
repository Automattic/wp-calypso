/**
 * External dependencies
 */
import React from 'react';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { CALYPSO_CONTACT } from 'calypso/lib/url/support';

const contactLink = <a href={ CALYPSO_CONTACT } target="_blank" rel="noopener noreferrer" />;
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
const cancelTransferErrorMessages = {
	enable_private_reg_failed: translate(
		'We were unable to enable Privacy Protection for your domain. ' +
			'Please try again or {{contactLink}}Contact Support{{/contactLink}} if you continue to have trouble.',
		{ components: { contactLink } }
	),
	decline_transfer_failed: translate(
		'We were unable to stop the transfer for your domain. ' +
			'Please try again or {{contactLink}}Contact Support{{/contactLink}} if you continue to have trouble.',
		{ components: { contactLink } }
	),
	lock_domain_failed: translate(
		'We were unable to lock your domain. ' +
			'Please try again or {{contactLink}}Contact Support{{/contactLink}} if you continue to have trouble.',
		{ components: { contactLink } }
	),
};

export const getDomainTransferCodeError = ( errorCode ) => {
	if ( errorCode && transferCodeErrorMessages.hasOwnProperty( errorCode ) ) {
		return translate(
			'An error occurred while trying to send the Domain Transfer code: {{strong}}%s{{/strong}} ' +
				'Please {{a}}Contact Support{{/a}}.',
			{
				args: transferCodeErrorMessages[ errorCode ],
				components: {
					strong: <strong />,
					a: contactLink,
				},
			}
		);
	}

	return translate(
		'An error occurred while trying to send the Domain Transfer code. ' +
			'Please try again or {{a}}Contact Support{{/a}} if you continue ' +
			'to have trouble.',
		{
			components: {
				a: contactLink,
			},
		}
	);
};

export const getCancelTransferSuccessMessage = ( { enablePrivacy, lockDomain } ) => {
	if ( enablePrivacy && lockDomain ) {
		return translate(
			"We've canceled your domain transfer. Your domain is now re-locked and " +
				'Privacy Protection has been enabled.'
		);
	} else if ( enablePrivacy ) {
		return translate(
			"We've canceled your domain transfer and " + 'Privacy Protection has been re-enabled.'
		);
	} else if ( lockDomain ) {
		return translate( "We've canceled your domain transfer and " + 're-locked your domain.' );
	}

	return translate( "We've canceled your domain transfer. " );
};

export const getCancelTransferErrorMessage = ( errorCode ) => {
	if ( errorCode && cancelTransferErrorMessages.hasOwnProperty( errorCode ) ) {
		return cancelTransferErrorMessages[ errorCode ];
	}

	return translate(
		'Oops! Something went wrong and your request could not be ' +
			'processed. Please try again or {{contactLink}}Contact Support{{/contactLink}} if ' +
			'you continue to have trouble.',
		{ components: { contactLink } }
	);
};

export const getNoticeOptions = ( domain ) => ( {
	duration: 5000,
	id: `domain-transfer-notification-${ domain }`,
} );
