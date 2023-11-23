import { JETPACK_SOCIAL_ADVANCED_PRODUCTS } from '@automattic/calypso-products';
import { useTranslate } from 'i18n-calypso';
import CheckoutTermsItem from 'calypso/my-sites/checkout/src/components/checkout-terms-item';
import type { ResponseCart } from '@automattic/shopping-cart';

export const showJetpackSocialAdvancedPricingDisclaimer = ( responseCart: ResponseCart ) => {
	const products = responseCart?.products;
	const product_slugs = products.map( ( product ) => product.product_slug );

	if ( product_slugs.length === 0 ) {
		return false;
	}
	const showJetpackProductPricingDisclaimer = JETPACK_SOCIAL_ADVANCED_PRODUCTS.filter( ( slug ) =>
		product_slugs.includes( slug )
	);

	if ( showJetpackProductPricingDisclaimer.length > 0 ) {
		return true;
	}

	return false;
};

export default function JetpackSocialAdvancedPricingDisclaimer() {
	const translate = useTranslate();

	return (
		<CheckoutTermsItem key="jetpack-product-pricing-disclaimer">
			{ translate(
				'The Jetpack Social Advanced plan is currently in a Beta state and not yet fully developed so the current price is half of the regular price. Enjoy using the plan at this discounted rate for the next year while we continue to develop the features.'
			) }
		</CheckoutTermsItem>
	);
}
