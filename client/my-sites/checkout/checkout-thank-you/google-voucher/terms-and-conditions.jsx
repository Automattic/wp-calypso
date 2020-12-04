/**
 * External dependencies
 */
import React from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import ExternalLink from 'calypso/components/external-link';
import { useLocalizedMoment } from 'calypso/components/localized-moment';

/*
 * Constants
 */
const expirationDate = '2020-06-30';

export default function GoogleTermsAndConditions() {
	const translate = useTranslate();
	const moment = useLocalizedMoment();

	return (
		<div>
			<h3>{ translate( 'Terms and conditions for this offer:' ) }</h3>
			<p>
				{ translate(
					'In the below terms, “Google Ads” may mean Google Ads or AdWords Express, as appropriate.'
				) }
			</p>
			<ol>
				<li className="google-voucher__terms-and-conditions">
					{ translate(
						'Offer available to customers with a billing address in the United States only. ' +
							'One promotional code per advertiser.'
					) }
				</li>

				<li className="google-voucher__terms-and-conditions">
					{ translate(
						'To activate this offer: Enter the promotional code in your account before %(expirationDate)s. ' +
							'In order to participate in this offer, ' +
							'you must enter the code within 14 days of your first ad impression being served from your first Google Ads account.',
						{
							args: {
								expirationDate: moment( expirationDate ).format( 'LL' ),
							},
						}
					) }
				</li>

				<li className="google-voucher__terms-and-conditions">
					{ translate(
						'To earn the credit: After entering the code, your advertising campaigns must accrue costs of at least $25, ' +
							'excluding any taxes, within 30 days. Making a payment of $25 is not sufficient. ' +
							'The tracking of advertising costs towards $25 begins after you’ve entered the code.'
					) }
				</li>

				<li className="google-voucher__terms-and-conditions">
					{ translate(
						'Once 2 and 3 are completed, the credit will typically be applied within 5 days to the Billing Summary of your account.'
					) }
				</li>

				<li className="google-voucher__terms-and-conditions">
					{ translate(
						'Credits apply to future advertising costs only. ' +
							'Credits cannot be applied to costs accrued before the code was entered.'
					) }
				</li>

				<li className="google-voucher__terms-and-conditions">
					{ translate(
						'You won’t receive a notification once your credit is used up and any additional advertising costs ' +
							'will be charged to your form of payment. ' +
							'If you don’t want to continue advertising, you can pause or delete your campaigns at any time.'
					) }
				</li>

				<li className="google-voucher__terms-and-conditions">
					{ translate(
						'Your account must be successfully billed by Google Ads ' +
							'and remain in good standing in order to qualify for the promotional credit.'
					) }
				</li>

				<li className="google-voucher__terms-and-conditions">
					{ translate( 'Full terms and conditions can be found here ' ) }
					<ExternalLink
						href="https://www.google.com/ads/coupons/terms.html"
						target="_blank"
						rel="noopener noreferrer"
					>
						https://www.google.com/ads/coupons/terms.html
					</ExternalLink>
					.
				</li>
			</ol>
		</div>
	);
}
