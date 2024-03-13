import { useTranslate } from 'i18n-calypso';
import CheckoutTermsItem from 'calypso/my-sites/checkout/src/components/checkout-terms-item';
import type { ResponseCart } from '@automattic/shopping-cart';

export default function ThirdPartyPluginsTermsOfService( { cart }: { cart: ResponseCart } ) {
	const translate = useTranslate();
	const hasMarketplaceProduct = cart.products.some(
		( product ) => product.extra.is_marketplace_product
	);

	if ( ! hasMarketplaceProduct ) {
		return null;
	}

	const thirdPartyPluginsTerms = translate(
		'You agree to our {{thirdPartyToS}}Third-Party Plugins Terms of Service{{/thirdPartyToS}}',
		{
			components: {
				thirdPartyToS: (
					<a
						href="https://wordpress.com/third-party-plugins-terms/"
						target="_blank"
						rel="noopener noreferrer"
					/>
				),
			},
		}
	);

	return <CheckoutTermsItem>{ thirdPartyPluginsTerms }</CheckoutTermsItem>;
}
