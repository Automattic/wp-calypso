import { localizeUrl } from '@automattic/i18n-utils';
import { HTTPS_SSL } from '@automattic/urls';
import { useTranslate } from 'i18n-calypso';
import CheckoutTermsItem from 'calypso/my-sites/checkout/src/components/checkout-terms-item';
import { useCartDomainTldsWithProductFlag } from 'calypso/my-sites/checkout/src/hooks/use-cart-domain-tlds-with-product-flag';
import type { ResponseCart } from '@automattic/shopping-cart';

export interface DomainRegistrationHstsProps {
	cart: ResponseCart;
}

export default function DomainRegistrationHsts( { cart }: DomainRegistrationHstsProps ) {
	const translate = useTranslate();
	const tlds = useCartDomainTldsWithProductFlag( cart, 'is_hsts_required' );

	if ( ! tlds.length ) {
		return null;
	}

	return (
		<CheckoutTermsItem>
			{ translate(
				'All domains ending in {{strong}}%(tld)s{{/strong}} require an SSL certificate ' +
					'to host a website. When you host this domain at WordPress.com an SSL ' +
					'certificate is included. {{a}}Learn more{{/a}}.',
				{
					args: {
						tld: tlds.join( ', ' ),
					},
					components: {
						a: <a href={ localizeUrl( HTTPS_SSL ) } target="_blank" rel="noopener noreferrer" />,
						strong: <strong />,
					},
				}
			) }
		</CheckoutTermsItem>
	);
}
