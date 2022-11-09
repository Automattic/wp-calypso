import { localize } from 'i18n-calypso';
import { Fragment } from 'react';
import { hasRenewableSubscription } from 'calypso/lib/cart-values/cart-items';
import AdditionalTermsOfServiceInCart from './additional-terms-of-service-in-cart';
import BundledDomainNotice from './bundled-domain-notice';
import ConciergeRefundPolicy from './concierge-refund-policy';
import DomainRegistrationAgreement from './domain-registration-agreement';
import DomainRegistrationHsts from './domain-registration-hsts';
import { EbanxTermsOfService } from './ebanx-terms-of-service';
import { GiftingTermsOfService } from './gifting-terms-of-service';
import { InternationalFeeNotice } from './international-fee-notice';
import RefundPolicies from './refund-policies';
import TermsOfService from './terms-of-service';
import ThirdPartyPluginsTermsOfService from './third-party-plugins-terms-of-service';
import TitanTermsOfService from './titan-terms-of-service';

/* eslint-disable wpcalypso/jsx-classname-namespace */

const CheckoutTerms = ( { translate, cart } ) => {
	const renderGiftToS = () => <GiftingTermsOfService />;

	const renderDefaultToS = () => {
		return (
			<>
				<TermsOfService hasRenewableSubscription={ hasRenewableSubscription( cart ) } />
				<DomainRegistrationAgreement cart={ cart } />
				<DomainRegistrationHsts cart={ cart } />
				<RefundPolicies cart={ cart } />
				<ConciergeRefundPolicy cart={ cart } />
				<BundledDomainNotice cart={ cart } />
				<TitanTermsOfService cart={ cart } />
				<ThirdPartyPluginsTermsOfService cart={ cart } />
				<EbanxTermsOfService />
				<InternationalFeeNotice />
				<AdditionalTermsOfServiceInCart />
			</>
		);
	};
	return (
		<Fragment>
			<div className="checkout__terms" id="checkout-terms">
				<strong>
					{ translate( 'By checking out:', {
						comment:
							'Headline before a list of terms the customer is agreeing to on checkout. Screenshot: https://user-images.githubusercontent.com/1379730/55166390-66c09080-5145-11e9-9c13-6c1b3b693786.png',
					} ) }
				</strong>
			</div>
			{ cart.gift_details ? renderGiftToS() : renderDefaultToS() }
		</Fragment>
	);
};

export default localize( CheckoutTerms );
