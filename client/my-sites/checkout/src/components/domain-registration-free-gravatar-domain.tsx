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
				"This is a free domain for your Gravatar profile. You're eligible to only one free domain for your Gravatar profile."
			) }
		</CheckoutTermsItem>
	);
}
