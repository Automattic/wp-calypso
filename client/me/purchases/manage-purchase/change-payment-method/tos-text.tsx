/**
 * External dependencies
 */
import React from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import { localizeUrl } from 'calypso/lib/i18n-utils';
import { AUTO_RENEWAL, MANAGE_PURCHASES } from 'calypso/lib/url/support';

export default function TosText(): JSX.Element {
	const translate = useTranslate();
	// TODO: Make sure we use the correct ToS text for paypal
	return (
		<>
			{ translate(
				'By saving a credit card, you agree to our {{tosLink}}Terms of Service{{/tosLink}}, and if ' +
					'you use it to pay for a subscription or plan, you authorize your credit card to be charged ' +
					'on a recurring basis until you cancel, which you can do at any time. ' +
					'You understand {{autoRenewalSupportPage}}how your subscription works{{/autoRenewalSupportPage}} ' +
					'and {{managePurchasesSupportPage}}how to cancel{{/managePurchasesSupportPage}}.',
				{
					components: {
						tosLink: (
							<a
								href={ localizeUrl( 'https://wordpress.com/tos/' ) }
								target="_blank"
								rel="noopener noreferrer"
							/>
						),
						autoRenewalSupportPage: (
							<a href={ AUTO_RENEWAL } target="_blank" rel="noopener noreferrer" />
						),
						managePurchasesSupportPage: (
							<a href={ MANAGE_PURCHASES } target="_blank" rel="noopener noreferrer" />
						),
					},
				}
			) }
		</>
	);
}
