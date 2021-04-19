/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import DomainPicker from '@automattic/domain-picker';
import { useShoppingCart } from '@automattic/shopping-cart';
import wp from 'calypso/lib/wp';
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import { domainRegistration } from 'calypso/lib/cart-values/cart-items';

// Aliasing wpcom functions explicitly bound to wpcom is required here;
// otherwise we get `this is not defined` errors.
const wpcom = wp.undocumented();
const wpcomGetCart = ( cartKey: string ) => wpcom.getCart( cartKey );

function DomainContainer( { selectedSite } ) {
	const { addProductsToCart } = useShoppingCart();
	const onDomainSelect = ( suggestion: any ) => {
		const { product_slug, domain_name } = suggestion;
		const domainProduct = {
			...domainRegistration( {
				productSlug: product_slug,
				domain: domain_name,
				source: 'Marketplace-Yoast-Domain-Upsell',
			} ),
			...suggestion,
		};
		addProductsToCart( [ domainProduct ] );
	};

	return (
		<div className="marketplace-domain-upsell__container">
			<DomainPicker onDomainSelect={ onDomainSelect } selectedSite={ selectedSite } />
		</div>
	);
}

export default function MarketplaceDomainUpsell( { selectedSite } ): any {
	return (
		<CalypsoShoppingCartProvider
			cartKey={ selectedSite?.slug }
			getCart={ wpcomGetCart }
			callId="MarketplaceDomainUpsell"
		>
			<DomainContainer selectedSite={ selectedSite } />
		</CalypsoShoppingCartProvider>
	);
}
