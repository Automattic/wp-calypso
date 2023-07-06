import { isDomainTransfer } from '@automattic/calypso-products';
import { useTranslate } from 'i18n-calypso';
import { Fragment } from 'react';
import isAkismetCheckout from 'calypso/lib/akismet/is-akismet-checkout';
import { hasRenewableSubscription } from 'calypso/lib/cart-values/cart-items';
import isJetpackCheckout from 'calypso/lib/jetpack/is-jetpack-checkout';
import { useSelector } from 'calypso/state';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
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
import type { ResponseCart } from '@automattic/shopping-cart';

export default function CheckoutTerms( { cart }: { cart: ResponseCart } ) {
	const isGiftPurchase = cart.is_gift_purchase;
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );
	const isJetpackNotAtomic = useSelector( ( state ) => {
		return siteId && isJetpackSite( state, siteId ) && ! isAtomicSite( state, siteId );
	} );
	const shouldShowRefundPolicy =
		! isJetpackCheckout() && ! isJetpackNotAtomic && ! isAkismetCheckout();
	const shouldShowInternationalFeeNotice =
		! isJetpackCheckout() && ! isJetpackNotAtomic && ! isAkismetCheckout();

	// Domain transfer is a one-time purchase, but it creates a renewable
	// subscription behind the scenes so we need to show the full TOS including
	// renewal text.
	const hasDomainTransfer = cart.products.some( ( product ) => isDomainTransfer( product ) );

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

			<TermsOfService
				hasRenewableSubscription={ hasRenewableSubscription( cart ) || hasDomainTransfer }
				isGiftPurchase={ Boolean( isGiftPurchase ) }
			/>
			{ ! isGiftPurchase && <DomainRegistrationAgreement cart={ cart } /> }
			{ ! isGiftPurchase && <DomainRegistrationHsts cart={ cart } /> }
			{ ! isGiftPurchase && <DomainRegistrationDotGay cart={ cart } /> }
			{ shouldShowRefundPolicy && <RefundPolicies cart={ cart } /> }
			{ ! isGiftPurchase && <BundledDomainNotice cart={ cart } /> }
			{ ! isGiftPurchase && <TitanTermsOfService cart={ cart } /> }
			{ ! isGiftPurchase && <ThirdPartyPluginsTermsOfService cart={ cart } /> }
			<EbanxTermsOfService />
			{ shouldShowInternationalFeeNotice && <InternationalFeeNotice /> }
			{ ! isGiftPurchase && <AdditionalTermsOfServiceInCart /> }
			<JetpackSocialAdvancedPricingDisclaimer />
		</Fragment>
	);
}
