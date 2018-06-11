/** @format */

/**
 * External dependencies
 */

import React from 'react';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import notices from 'notices';
import { CALYPSO_CONTACT } from 'lib/url/support';
import Notice from 'components/notice';

export const renderGdprTransferWarningNotice = () => {
	return (
		<Notice status="is-warning" showDismiss={ false }>
			{ translate(
				"Due to the EU's {{gdpr}}General Data Protection Regulation{{/gdpr}}, " +
					'some providers may have trouble transferring your domain to them. ' +
					'{{learn}}Learn more.{{/learn}}',
				{
					components: {
						gdpr: (
							<a href="https://automattic.com/automattic-and-the-general-data-protection-regulation-gdpr/" />
						),
						learn: (
							<a href="https://en.support.wordpress.com/move-domain/transfer-domain-registration/#what-if-my-new-registrar-says-they-cant-start-my-transfer-because-my-contact-information-is-not-public" />
						),
					},
				}
			) }
		</Notice>
	);
};

export const displayResponseError = responseError => {
	const errorMessages = {
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

	if ( responseError.error && Object.keys( errorMessages ).indexOf( responseError.error ) !== -1 ) {
		notices.error(
			translate(
				'An error occurred while trying to send the Domain Transfer code: {{strong}}%s{{/strong}} ' +
					'Please {{a}}Contact Support{{/a}}.',
				{
					args: errorMessages[ responseError.error ],
					components: {
						strong: <strong />,
						a: <a href={ CALYPSO_CONTACT } target="_blank" rel="noopener noreferrer" />,
					},
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
						a: <a href={ CALYPSO_CONTACT } target="_blank" rel="noopener noreferrer" />,
					},
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
				"We have sent the transfer authorization code to the domain registrant's email address. " +
					"If you don't receive the email shortly, please check your spam folder."
			)
		);
	}
};
