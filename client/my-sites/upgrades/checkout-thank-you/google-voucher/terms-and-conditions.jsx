/**
 * External dependencies
 */
import React from 'react';
import i18n from 'i18n-calypso';

const googleTermsAndConditions = () => {
	return(
		<div>
			<h3>{ i18n.translate( 'Terms and conditions for this offer:' ) }</h3>
			<p>{ i18n.translate( 'In the below terms, “AdWords” may mean AdWords or AdWords Express, as appropriate.' ) }</p>
			<ol>
				<li className="google-voucher__terms-and-conditions">{ i18n.translate( 'Offer available to customers with a billing address in the United States only. One promotional code per advertiser.' ) }</li>

				<li className="google-voucher__terms-and-conditions">{ i18n.translate( 'To activate this offer: Enter the promotional code in your account before December 31 2016. In order to participate in this offer, you must enter the code within 14 days of your first ad impression being served from your first AdWords account.' ) }</li>

				<li className="google-voucher__terms-and-conditions">{ i18n.translate( 'To earn the credit: After entering the code, your advertising campaigns must accrue costs of at least $25, excluding any taxes, within 30 days. Making a payment of $25 is not sufficient. The tracking of advertising costs towards $25 begins after you’ve entered the code.' ) }</li>

				<li className="google-voucher__terms-and-conditions">{ i18n.translate( 'Once 2 and 3 are completed, the credit will typically be applied within 5 days to the Billing Summary of your account.' ) }</li>

				<li className="google-voucher__terms-and-conditions">{ i18n.translate( 'Credits apply to future advertising costs only. Credits cannot be applied to costs accrued before the code was entered.' ) }</li>

				<li className="google-voucher__terms-and-conditions">{ i18n.translate( 'You won’t receive a notification once your credit is used up and any additional advertising costs will be charged to your form of payment. If you don’t want to continue advertising, you can pause or delete your campaigns at any time.' ) }</li>

				<li className="google-voucher__terms-and-conditions">{ i18n.translate( 'Your account must be successfully billed by AdWords and remain in good standing in order to qualify for the promotional credit.' ) }</li>

				<li className="google-voucher__terms-and-conditions">
					{ i18n.translate( 'Full terms and conditions can be found here ' ) }
					<a
						href="http://www.google.com/adwords/coupons/terms.html"
						target="_blank"
					>
						http://www.google.com/adwords/coupons/terms.html
					</a>.
				</li>
			</ol>
		</div>
	);
};

export default googleTermsAndConditions;
