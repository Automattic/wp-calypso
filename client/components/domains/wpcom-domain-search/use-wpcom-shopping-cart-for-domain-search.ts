/* eslint-disable no-restricted-imports */
import { DomainSearch } from '@automattic/domain-search';
import { formatCurrency } from '@automattic/number-formatters';
import { type CartKey, type ResponseCartProduct, useShoppingCart } from '@automattic/shopping-cart';
import { ComponentProps, useMemo } from 'react';

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

interface UseWPCOMShoppingCartForDomainSearchOptions {
	cartKey: CartKey;
	flowName?: string;
}

export const useWPCOMShoppingCartForDomainSearch = ( {
	cartKey,
	flowName,
}: UseWPCOMShoppingCartForDomainSearchOptions ) => {
	const { responseCart, addProductsToCart, removeProductFromCart } = useShoppingCart( cartKey );

	return useMemo( () => {
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

		const cart: ComponentProps< typeof DomainSearch >[ 'cart' ] = {
			items: domainItems.map( wpcomCartToDomainSearchCart ),
			total,
			hasItem: ( domain ) => !! domainItems.find( ( item ) => item.meta === domain ),
			onAddItem: ( { domain_name, product_slug, supports_privacy } ) => {
				return addProductsToCart( [
					{
						product_slug,
						meta: domain_name,
						extra: {
							...( supports_privacy && {
								privacy_available: supports_privacy,
								privacy: supports_privacy,
							} ),
							...( flowName && { flow_name: flowName } ),
						},
					},
				] );
			},
			onRemoveItem: ( uuid ) => removeProductFromCart( uuid ),
		};

		return { cart, isNextDomainFree: responseCart.next_domain_is_free };
	}, [ responseCart, removeProductFromCart, addProductsToCart, flowName ] );
};
