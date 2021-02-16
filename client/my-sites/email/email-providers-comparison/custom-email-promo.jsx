/**
 * External dependencies
 */
import React from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import emailIllustration from 'calypso/assets/images/email-providers/email-illustration.svg';
import PromoCard from 'calypso/components/promo-section/promo-card';

/**
 * Style dependencies
 */
import './style.scss';

export default function CustomEmailPromo( { domainName, children } ) {
	const translate = useTranslate();
	const image = {
		path: emailIllustration,
		align: 'right',
	};

	const translateArgs = {
		args: {
			domainName,
		},
		comment: '%(domainName)s is the domain name, e.g example.com',
	};

	return (
		<PromoCard
			isPrimary
			title={ translate( 'Get your own @%(domainName)s email address', translateArgs ) }
			image={ image }
			className="email-providers-comparison__action-panel"
			icon=""
		>
			<p>
				{ translate(
					'Pick one of our flexible options to connect your domain with email ' +
						'and start getting emails @%(domainName)s today.',
					translateArgs
				) }
			</p>
			{ children }
		</PromoCard>
	);
}
