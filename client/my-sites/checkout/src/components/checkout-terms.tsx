import { isDomainTransfer } from '@automattic/calypso-products';
import { FoldableCard } from '@automattic/components';
import { styled } from '@automattic/wpcom-checkout';
import { useSelect } from '@wordpress/data';
import { useTranslate } from 'i18n-calypso';
import { Children, Fragment, ReactNode, isValidElement } from 'react';
import isAkismetCheckout from 'calypso/lib/akismet/is-akismet-checkout';
import {
	has100YearPlan,
	hasRenewableSubscription,
	has100YearDomain,
} from 'calypso/lib/cart-values/cart-items';
import isJetpackCheckout from 'calypso/lib/jetpack/is-jetpack-checkout';
import DomainPromotionalPricingRestrictions from 'calypso/my-sites/checkout/src/components/domain-promotional-pricing-restrictions';
import { useSelector } from 'calypso/state';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { CHECKOUT_STORE } from '../lib/wpcom-store';
import AdditionalTermsOfServiceInCart from './additional-terms-of-service-in-cart';
import BundledDomainNotice, { showBundledDomainNotice } from './bundled-domain-notice';
import DomainRegistrationAgreement from './domain-registration-agreement';
import DomainRegistrationDotGay from './domain-registration-dot-gay';
import { DomainRegistrationFreeGravatarDomain } from './domain-registration-free-gravatar-domain';
import DomainRegistrationHsts from './domain-registration-hsts';
import { EbanxTermsOfService } from './ebanx-terms-of-service';
import { showInternationalFeeNotice, InternationalFeeNotice } from './international-fee-notice';
import JetpackSocialAdvancedPricingDisclaimer, {
	showJetpackSocialAdvancedPricingDisclaimer,
} from './jetpack-social-advanced-pricing-disclaimer';
import RefundPolicies from './refund-policies';
import { PlanTerms100Year, DomainTerms100Year } from './terms-100-year';
import { TermsOfService } from './terms-of-service';
import ThirdPartyPluginsTermsOfService from './third-party-plugins-terms-of-service';
import TitanTermsOfService from './titan-terms-of-service';
import type { ResponseCart } from '@automattic/shopping-cart';

const TermsCollapsedContent = styled.div`
	& .foldable-card__main {
		position: relative;
		left: 20px;
	}

	& .foldable-card__expand {
		position: absolute;
		left: -24px;
		top: -3px;
		width: 20px;
	}

	& .foldable-card__secondary {
		display: none;
	}

	.rtl & .foldable-card__main {
		right: 20px;
	}
	.rtl & .foldable-card__expand {
		right: -24px;
	}
`;

export default function CheckoutTerms( { cart }: { cart: ResponseCart } ) {
	const isGiftPurchase = cart.is_gift_purchase;
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );
	const isJetpackNotAtomic = useSelector( ( state ) => {
		return siteId && isJetpackSite( state, siteId ) && ! isAtomicSite( state, siteId );
	} );
	const contactInfo = useSelect( ( select ) => select( CHECKOUT_STORE ).getContactInfo(), [] );
	const isNotJetpackOrAkismetCheckout =
		! isJetpackCheckout() && ! isJetpackNotAtomic && ! isAkismetCheckout();

	// Domain transfer is a one-time purchase, but it creates a renewable
	// subscription behind the scenes so we need to show the full TOS including
	// renewal text.
	const hasDomainTransfer = cart.products.some( ( product ) => isDomainTransfer( product ) );

	const shouldShowBundledDomainNotice = showBundledDomainNotice( cart );
	const shouldShowRefundPolicy = isNotJetpackOrAkismetCheckout;
	const shouldShowInternationalFeeNotice =
		showInternationalFeeNotice( contactInfo ) && isNotJetpackOrAkismetCheckout;
	const shouldShowJetpackSocialAdvancedPricingDisclaimer =
		showJetpackSocialAdvancedPricingDisclaimer( cart );

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
				is100YearPlanPurchase={ has100YearPlan( cart ) }
				is100YearDomainPurchase={ has100YearDomain( cart ) }
			/>
			<>
				{ ! isGiftPurchase && <DomainTerms100Year cart={ cart } /> }
				{ ! isGiftPurchase && <DomainRegistrationAgreement cart={ cart } /> }
				{ ! isGiftPurchase && <DomainPromotionalPricingRestrictions cart={ cart } /> }
				{ ! isGiftPurchase && <DomainRegistrationHsts cart={ cart } /> }
				{ ! isGiftPurchase && <DomainRegistrationDotGay cart={ cart } /> }
				{ ! isGiftPurchase && <DomainRegistrationFreeGravatarDomain cart={ cart } /> }
				<EbanxTermsOfService />
				{ ! isGiftPurchase && <PlanTerms100Year cart={ cart } /> }
				{ ! isGiftPurchase && <AdditionalTermsOfServiceInCart /> }
				{ ! isGiftPurchase && <ThirdPartyPluginsTermsOfService cart={ cart } /> }
				{ ! isGiftPurchase && <TitanTermsOfService cart={ cart } /> }

				<CheckoutTermsReadMore>
					{ shouldShowRefundPolicy && <RefundPolicies cart={ cart } /> }
					{ shouldShowBundledDomainNotice && <BundledDomainNotice cart={ cart } /> }
					{ shouldShowInternationalFeeNotice && <InternationalFeeNotice /> }
					{ shouldShowJetpackSocialAdvancedPricingDisclaimer && (
						<JetpackSocialAdvancedPricingDisclaimer />
					) }
				</CheckoutTermsReadMore>
			</>
		</Fragment>
	);
}

/**
 * Render a FoldableCard to contain TOS items or nothing if there are no items.
 */
function CheckoutTermsReadMore( { children }: { children: ReactNode } ) {
	const translate = useTranslate();
	// Note that this technique for finding children does not work for strings or
	// empty fragments. Hopefully all children passed to this component are
	// components themselves or null.
	if ( ! children || Children.toArray( children ).filter( isValidElement ).length === 0 ) {
		return null;
	}
	return (
		<TermsCollapsedContent>
			<FoldableCard
				clickableHeader
				compact
				className="checkout__terms-foldable-card"
				header={ translate( 'Read more' ) }
				screenReaderText={ translate( 'Read more' ) }
			>
				{ children }
			</FoldableCard>
		</TermsCollapsedContent>
	);
}
