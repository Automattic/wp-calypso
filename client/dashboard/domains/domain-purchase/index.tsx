/* eslint-disable no-restricted-imports */
import { DomainSearch } from '@automattic/domain-search';
import { formatCurrency } from '@automattic/number-formatters';
import {
	ResponseCartProduct,
	ShoppingCartProvider,
	useShoppingCart,
} from '@automattic/shopping-cart';
import { ComponentProps, useMemo } from 'react';
import { domainRegistration, updatePrivacyForDomain } from 'calypso/lib/cart-values/cart-items';
import { shoppingCartManagerClient } from '../../app/shopping-cart';
import PageLayout from '../../components/page-layout';

import './style.scss';

const wpcomCartToDomainSearchCart = ( domain: ResponseCartProduct ) => {
	const [ domainName, ...tld ] = domain.meta.split( '.' );

	const hasPromotion = domain.cost_overrides?.some(
		( override ) => ! override.does_override_original_cost
	);

	const currentPrice = formatCurrency( domain.item_subtotal_integer, domain.currency, {
		isSmallestUnit: true,
		stripZeros: true,
	} );

	const originalPrice = formatCurrency( domain.item_original_cost_integer, domain.currency, {
		isSmallestUnit: true,
		stripZeros: true,
	} );

	return {
		uuid: domain.uuid,
		domain: domainName,
		tld: tld.join( '.' ),
		salePrice: hasPromotion ? currentPrice : undefined,
		price: hasPromotion ? originalPrice : currentPrice,
	};
};

const FLOW_NAME = 'domain-purchase';

const DomainSearchWithCart = () => {
	const CART_KEY = 'no-site';
	const { responseCart, addProductsToCart, removeProductFromCart } = useShoppingCart( CART_KEY );

	const cart: ComponentProps< typeof DomainSearch >[ 'cart' ] = useMemo( () => {
		const domainItems = responseCart.products.filter(
			( product ) => product.is_domain_registration
		);

		const total = formatCurrency(
			domainItems.reduce( ( acc, item ) => acc + item.item_subtotal_integer, 0 ),
			responseCart.currency ?? 'USD',
			{
				isSmallestUnit: true,
				stripZeros: true,
			}
		);

		return {
			items: domainItems.map( ( domain ) => wpcomCartToDomainSearchCart( domain ) ),
			total,
			onAddItem: ( suggestion ) => {
				const {
					domain_name: domain,
					product_slug: productSlug,
					supports_privacy: supportsPrivacy,
				} = suggestion;

				let registration = domainRegistration( {
					domain,
					productSlug: productSlug ?? '',
					extra: { privacy_available: supportsPrivacy, flow_name: FLOW_NAME },
				} );

				if ( supportsPrivacy ) {
					registration = updatePrivacyForDomain( registration, true );
				}

				return addProductsToCart( [ registration ] );
			},
			onRemoveItem: ( uuid ) => removeProductFromCart( uuid ),
			hasItem: ( domain ) => !! domainItems.find( ( item ) => item.meta === domain ),
		};
	}, [ responseCart.products, responseCart.currency, addProductsToCart, removeProductFromCart ] );

	const events = useMemo( () => {
		return {
			onContinue: () => {
				window.location.href = `/checkout/${ CART_KEY }?signup=1&isDomainOnly=1`;
			},
		};
	}, [] );

	return <DomainSearch className="dashboard-domain-search" cart={ cart } events={ events } />;
};

export default function DomainPurchase() {
	return (
		<PageLayout>
			<ShoppingCartProvider managerClient={ shoppingCartManagerClient }>
				<DomainSearchWithCart />
			</ShoppingCartProvider>
		</PageLayout>
	);
}
