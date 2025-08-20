import { CONTACT } from '@automattic/urls';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { ReactElement } from 'react';
import InlineSupportLink from '../../components/inline-support-link';
import type { SslDetails } from '../../data/domain-ssl';

export const useSslStatusMessage = ( sslDetails: SslDetails ) => {
	const showFailureReasons = !! sslDetails.failure_reasons && sslDetails.failure_reasons.length > 0;

	const getSslStatusMessage = (): ReactElement | string => {
		if ( sslDetails.certificate_provisioned ) {
			return createInterpolateElement(
				__(
					/* translators: <link> will be replaced with an a support link */
					'We give you strong HTTPS encryption with your domain for free. This provides a trust indicator for your visitors and keeps their connection to your site secure. <link>Learn more</link>'
				),
				{
					link: <InlineSupportLink supportContext="https-ssl" />,
				}
			);
		}

		if ( sslDetails.is_newly_registered ) {
			return __(
				'Your newly registered domain is almost ready! It can take up to 30 minutes for the domain to start resolving to your site so we can issue a new SSL certificate. Please check back soon.'
			);
		}

		if ( sslDetails.is_expired ) {
			return __( 'Your domain has expired. Renew your domain to issue a new SSL certificate.' );
		}

		if ( showFailureReasons ) {
			return __(
				'There are one or more problems with your DNS configuration that prevent an SSL certificate from being issued.'
			);
		}

		if ( sslDetails.failure_reasons ) {
			return __(
				'There was a problem issuing your SSL certificate. You can request a new certificate by clicking the button below.'
			);
		}

		return createInterpolateElement(
			__( 'There is an issue with your certificate. Contact us to <link>learn more</link>.' ),
			{
				link: <a href={ CONTACT } target="_blank" rel="noopener noreferrer" />,
			}
		);
	};

	return {
		message: getSslStatusMessage(),
		failureReasons: sslDetails.failure_reasons,
	};
};
