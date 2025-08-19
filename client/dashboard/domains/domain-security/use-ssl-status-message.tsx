import { CONTACT } from '@automattic/urls';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { ReactElement } from 'react';
import InlineSupportLink from '../../components/inline-support-link';
import type { SslDetails } from '../../data/domain-ssl';

type StatusConfig = {
	message: string | ReactElement;
	showFailureReasons?: boolean;
	showProvisionInstructions?: boolean;
};

export const useSslStatusMessage = ( sslDetails: SslDetails ) => {
	const statusConfig: Record< string, StatusConfig > = {
		certificate_provisioned: {
			message: createInterpolateElement(
				__(
					'We give you strong HTTPS encryption with your domain for free. This provides a trust indicator for your visitors and keeps their connection to your site secure. <link>Learn more</link>'
				),
				{
					link: <InlineSupportLink supportContext="https-ssl" />,
				}
			),
		},
		is_newly_registered: {
			message: __(
				'Your newly registered domain is almost ready! It can take up to 30 minutes for the domain to start resolving to your site so we can issue a new SSL certificate. Please check back soon.'
			),
		},
		is_expired: {
			message: __( 'Your domain has expired. Renew your domain to issue a new SSL certificate.' ),
		},
		has_failure_reasons: {
			message: __(
				'There are one or more problems with your DNS configuration that prevent an SSL certificate from being issued.'
			),
			showFailureReasons: true,
			showProvisionInstructions: true,
		},
		general_failure: {
			message: __(
				'There was a problem issuing your SSL certificate. You can request a new certificate by clicking the button below.'
			),
		},
		default: {
			message: createInterpolateElement(
				__( 'There is an issue with your certificate. Contact us to <link>learn more</link>.' ),
				{
					link: <a href={ CONTACT } target="_blank" rel="noopener noreferrer" />,
				}
			),
		},
	};

	// Determine the current status
	let currentStatus: keyof typeof statusConfig;

	if ( sslDetails.certificate_provisioned ) {
		currentStatus = 'certificate_provisioned';
	} else if ( sslDetails.is_newly_registered ) {
		currentStatus = 'is_newly_registered';
	} else if ( sslDetails.is_expired ) {
		currentStatus = 'is_expired';
	} else if ( sslDetails.failure_reasons ) {
		currentStatus =
			sslDetails.failure_reasons.length > 0 ? 'has_failure_reasons' : 'general_failure';
	} else {
		currentStatus = 'default';
	}

	const config = statusConfig[ currentStatus ];

	return {
		message: config.message,
		showFailureReasons: config.showFailureReasons,
		showProvisionInstructions: config.showProvisionInstructions,
		failureReasons: sslDetails.failure_reasons,
	};
};
