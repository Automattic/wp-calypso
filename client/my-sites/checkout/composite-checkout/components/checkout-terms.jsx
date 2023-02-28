import { localize } from 'i18n-calypso';
import { Component, Fragment } from 'react';
import { hasRenewableSubscription } from 'calypso/lib/cart-values/cart-items';
import AdditionalTermsOfServiceInCart from './additional-terms-of-service-in-cart';
import BundledDomainNotice from './bundled-domain-notice';
import DomainRegistrationAgreement from './domain-registration-agreement';
import DomainRegistrationDotGay from './domain-registration-dot-gay';
import DomainRegistrationHsts from './domain-registration-hsts';
import { EbanxTermsOfService } from './ebanx-terms-of-service';
import { InternationalFeeNotice } from './international-fee-notice';
import JetpackSocialAdvancedPricingDisclaimer from './jetpack-social-advanced-pricing-disclaimer';
import RefundPolicies from './refund-policies';
import { TermsOfService } from './terms-of-service';
import ThirdPartyPluginsTermsOfService from './third-party-plugins-terms-of-service';
import TitanTermsOfService from './titan-terms-of-service';

/* eslint-disable wpcalypso/jsx-classname-namespace */

class CheckoutTerms extends Component {
	render() {
		const { cart } = this.props;
		const isGiftPurchase = cart.is_gift_purchase;

		return (
			<Fragment>
				<div className="checkout__terms" id="checkout-terms">
					<strong>
						{ this.props.translate( 'By checking out:', {
							comment:
								'Headline before a list of terms the customer is agreeing to on checkout. Screenshot: https://user-images.githubusercontent.com/1379730/55166390-66c09080-5145-11e9-9c13-6c1b3b693786.png',
						} ) }
					</strong>
				</div>

				<TermsOfService
					hasRenewableSubscription={ hasRenewableSubscription( cart ) }
					isGiftPurchase={ isGiftPurchase }
				/>
				{ ! isGiftPurchase && <DomainRegistrationAgreement cart={ cart } /> }
				{ ! isGiftPurchase && <DomainRegistrationHsts cart={ cart } /> }
				{ ! isGiftPurchase && <DomainRegistrationDotGay cart={ cart } /> }
				<RefundPolicies cart={ cart } />
				{ ! isGiftPurchase && <BundledDomainNotice cart={ cart } /> }
				{ ! isGiftPurchase && <TitanTermsOfService cart={ cart } /> }
				{ ! isGiftPurchase && <ThirdPartyPluginsTermsOfService cart={ cart } /> }
				<EbanxTermsOfService />
				<InternationalFeeNotice />
				{ ! isGiftPurchase && <AdditionalTermsOfServiceInCart /> }
				<JetpackSocialAdvancedPricingDisclaimer />
			</Fragment>
		);
	}
}

export default localize( CheckoutTerms );
