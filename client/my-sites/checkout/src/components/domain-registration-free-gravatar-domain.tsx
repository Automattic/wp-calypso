import { useTranslate } from 'i18n-calypso';
import { getDomainRegistrations } from 'calypso/lib/cart-values/cart-items';
import CheckoutTermsItem from 'calypso/my-sites/checkout/src/components/checkout-terms-item';
import type { ResponseCart } from '@automattic/shopping-cart';

interface DomainRegistrationFreeGravatarDomainProps {
	cart: ResponseCart;
}

export function DomainRegistrationFreeGravatarDomain(
	props: DomainRegistrationFreeGravatarDomainProps
) {
	const translate = useTranslate();
	const domains = getDomainRegistrations( props.cart );

	if ( ! domains.some( ( domain ) => domain.extra?.is_gravatar_domain ) ) {
		return null;
	}

	return (
		<CheckoutTermsItem>
			{ translate(
				'This domain is provided at no cost for the first year for use with your Gravatar profile. This offer is limited to one free domain per user. If you cancel this domain, you will have to pay the standard price to register another domain for your Gravatar profile.'
			) }
		</CheckoutTermsItem>
	);
}
