/**
 * External dependencies
 */
import React from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import { localizeUrl } from 'calypso/lib/i18n-utils';
import {
	MANAGE_PURCHASES_AUTOMATIC_RENEWAL,
	MANAGE_PURCHASES_FAQ_CANCELLING,
} from 'calypso/lib/url/support';

export default function TosText(): JSX.Element {
	const translate = useTranslate();
	return (
		<>
			{ translate(
				'You agree to our {{tosLink}}Terms of Service{{/tosLink}} and authorize your payment method to be charged on a recurring basis until you cancel, which you can do at any time. You understand {{autoRenewalSupportPage}}how your subscription works{{/autoRenewalSupportPage}} and {{faqCancellingSupportPage}}how to cancel{{/faqCancellingSupportPage}}.',
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
							<a
								href={ MANAGE_PURCHASES_AUTOMATIC_RENEWAL }
								target="_blank"
								rel="noopener noreferrer"
							/>
						),
						faqCancellingSupportPage: (
							<a
								href={ MANAGE_PURCHASES_FAQ_CANCELLING }
								target="_blank"
								rel="noopener noreferrer"
							/>
						),
					},
				}
			) }
		</>
	);
}
