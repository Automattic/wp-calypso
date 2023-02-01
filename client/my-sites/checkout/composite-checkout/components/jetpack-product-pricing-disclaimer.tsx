import { JETPACK_FIRST_YEAR_50_PERCENT_OFF_PRODUCTS } from '@automattic/calypso-products';
import { useShoppingCart } from '@automattic/shopping-cart';
import { useTranslate } from 'i18n-calypso';
import CheckoutTermsItem from 'calypso/my-sites/checkout/composite-checkout/components/checkout-terms-item';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';

export default function JetpackProductPricingDisclaimer() {
	const cartKey = useCartKey();
	const translate = useTranslate();
	const { responseCart } = useShoppingCart( cartKey );

	const products = responseCart?.products;
	const product_slugs = products.map( ( product ) => product.product_slug );
	if ( product_slugs.length === 0 ) {
		return null;
	}
	const product_names = products.map( ( product ) => product.product_name );

	const showJetpackProductPricingDisclaimer = JETPACK_FIRST_YEAR_50_PERCENT_OFF_PRODUCTS.filter(
		( slug ) => product_slugs.includes( slug )
	);
	if ( showJetpackProductPricingDisclaimer.length > 0 ) {
		return (
			<CheckoutTermsItem key="jetpack-product-pricing-disclaimer">
				{ translate(
					'The following products are currently in development: %(productNames)s Enjoy using them at half price over the next year while we continue to develop the features.',
					{ args: { productNames: product_names.join( ',' ) } }
				) }
			</CheckoutTermsItem>
		);
	}

	return null;
}
