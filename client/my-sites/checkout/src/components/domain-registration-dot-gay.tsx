import { useTranslate } from 'i18n-calypso';
import CheckoutTermsItem from 'calypso/my-sites/checkout/src/components/checkout-terms-item';
import { useCartDomainTldsWithProductFlag } from 'calypso/my-sites/checkout/src/hooks/use-cart-domain-tlds-with-product-flag';
import type { ResponseCart } from '@automattic/shopping-cart';

export default function DomainRegistrationDotGay( { cart }: { cart: ResponseCart } ) {
	const translate = useTranslate();
	const tlds = useCartDomainTldsWithProductFlag( cart, 'is_dot_gay_notice_required' );

	if ( ! tlds.length ) {
		return null;
	}

	return (
		<CheckoutTermsItem>
			{ translate(
				'The use of .gay domains to host any anti-LGBTQ content is prohibited and can result in registration termination. The registry will donate 20% of all registration revenue to LGBTQ non-profit organizations.'
			) }
		</CheckoutTermsItem>
	);
}
