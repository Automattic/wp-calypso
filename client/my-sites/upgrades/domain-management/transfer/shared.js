/**
 * External dependencies
 */
import React from 'react';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import notices from 'notices';
import support from 'lib/url/support';

export const displayResponseError = ( responseError ) => {
	const errorMessages = {
		unlock_domain_and_disable_private_reg_failed: translate(
			'The domain could not be unlocked. ' +
			'Additionally, Privacy Protection could not be disabled. ' +
			'The transfer will most likely fail due to these errors.'
		),
		unlock_domain_failed: translate(
			'The domain could not be unlocked. ' +
			'The transfer will most likely fail due to this error.'
		),
		disable_private_reg_failed: translate(
			'Privacy Protection could not be disabled. ' +
			'The transfer will most likely fail due to this error.'
		)
	};

	if ( responseError.error && Object.keys( errorMessages ).indexOf( responseError.error ) !== - 1 ) {
		notices.error(
			translate(
				'An error occurred while trying to send the Domain Transfer code: {{strong}}%s{{/strong}} ' +
				'Please {{a}}Contact Support{{/a}}.',
				{
					args: errorMessages[ responseError.error ],
					components: {
						strong: <strong />,
						a: <a href={ support.CALYPSO_CONTACT } target="_blank"/>
					}
				}
			)
		);
	} else {
		notices.error(
			translate(
				'An error occurred while trying to send the Domain Transfer code. ' +
				'Please try again or {{a}}Contact Support{{/a}} if you continue ' +
				'to have trouble.',
				{
					components: {
						a: <a href={ support.CALYPSO_CONTACT } target="_blank"/>
					}
				}
			)
		);
	}
};

export const displayRequestTransferCodeResponseNotice = ( responseError, domainStatus ) => {
	if ( responseError ) {
		displayResponseError( responseError );
		return;
	}

	if ( domainStatus.manualTransferRequired ) {
		notices.success(
			translate(
				'The registry for your domain requires a special process for transfers. ' +
				'Our Happiness Engineers have been notified about your transfer request and will be in touch ' +
				'shortly to help you complete the process.'
			)
		);
	} else {
		notices.success(
			translate(
				'We have sent the transfer authorization code to the domain registrant\'s email address. ' +
				'If you don\'t receive the email shortly, please check your spam folder.'
			)
		);
	}
};
