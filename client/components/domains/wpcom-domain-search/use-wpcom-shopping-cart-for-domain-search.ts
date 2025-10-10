/* eslint-disable no-restricted-imports */
import { isPlan } from '@automattic/calypso-products';
import { DomainSearch } from '@automattic/domain-search';
import { formatCurrency } from '@automattic/number-formatters';
import {
	type CartKey,
	type MinimalRequestCartProduct,
	type ResponseCartProduct,
	useShoppingCart,
} from '@automattic/shopping-cart';
import { ComponentProps, useMemo } from 'react';
import { getDomainsInCart } from '../../../lib/cart-values/cart-items';

const wpcomCartToDomainSearchCart = (
	domain: ResponseCartProduct,
	isFirstDomainFreeForFirstYear: boolean
) => {
	const [ domainName, ...tld ] = domain.meta.split( '.' );

	const hasPromotion =
		isFirstDomainFreeForFirstYear ||
		domain.cost_overrides?.some( ( override ) => ! override.does_override_original_cost );

	const currentPrice = formatCurrency(
		isFirstDomainFreeForFirstYear ? 0 : domain.item_subtotal_integer,
		domain.currency,
		{
			isSmallestUnit: true,
			stripZeros: true,
		}
	);

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
		isFirstDomainFreeForFirstYear,
	};
};

interface UseWPCOMShoppingCartForDomainSearchOptions {
	cartKey: CartKey;
	flowName?: string;
	flowAllowsMultipleDomainsInCart: boolean;
	isFirstDomainFreeForFirstYear: boolean;
	onContinue?( cartItems: ResponseCartProduct[] ): void;
	beforeAddDomainToCart?: ( domain: MinimalRequestCartProduct ) => MinimalRequestCartProduct;
}

export const useWPCOMShoppingCartForDomainSearch = ( {
	cartKey,
	flowName,
	flowAllowsMultipleDomainsInCart,
	isFirstDomainFreeForFirstYear,
	onContinue,
	beforeAddDomainToCart = ( domain ) => domain,
}: UseWPCOMShoppingCartForDomainSearchOptions ) => {
	const { responseCart, addProductsToCart, removeProductFromCart } = useShoppingCart( cartKey );

	return useMemo( () => {
		const domainItems = flowAllowsMultipleDomainsInCart ? getDomainsInCart( responseCart ) : [];
		const isPlanInCart =
			responseCart.products.find( ( product ) => isPlan( product ) ) !== undefined;
		// If there's an annual plan in the cart, the backend will already set the first domain as free.
		// If there's a monthly plan in the cart, the backend will not set the first domain as free and
		// we'll also not set it as free here, which is correct since monthly plans don't have a free domain.
		// We have to check if there's a plan in the cart here since the user's cart might not be empty
		// when they start a domain search flow.
		const shouldFirstDomainBeFree = isFirstDomainFreeForFirstYear && ! isPlanInCart;

		// Order domains from most expensive to least expensive
		domainItems.sort( ( a, b ) => {
			// Put the bundled domain at the top, if there's one
			if ( responseCart.bundled_domain === a.meta ) {
				return -1;
			} else if ( responseCart.bundled_domain === b.meta ) {
				return 1;
			}
			return b.item_subtotal_integer - a.item_subtotal_integer;
		} );

		const total = formatCurrency(
			domainItems.reduce(
				( acc, item, index ) =>
					acc + ( index === 0 && shouldFirstDomainBeFree ? 0 : item.item_subtotal_integer ),
				0
			),
			responseCart.currency ?? 'USD',
			{
				isSmallestUnit: true,
				stripZeros: true,
			}
		);

		const cart: ComponentProps< typeof DomainSearch >[ 'cart' ] = {
			items: domainItems.map( ( domainItem, index ) =>
				wpcomCartToDomainSearchCart( domainItem, index === 0 && shouldFirstDomainBeFree )
			),
			total,
			hasItem: ( domain ) => !! domainItems.find( ( item ) => item.meta === domain ),
			onAddItem: async ( { domain_name, product_slug, supports_privacy } ) => {
				const cartItems = await addProductsToCart( [
					beforeAddDomainToCart( {
						product_slug,
						meta: domain_name,
						extra: {
							...( supports_privacy && {
								privacy_available: supports_privacy,
								privacy: supports_privacy,
							} ),
							...( flowName && { flow_name: flowName } ),
						},
					} ),
				] );

				if ( ! flowAllowsMultipleDomainsInCart ) {
					return onContinue?.( cartItems.products.filter( ( item ) => item.meta === domain_name ) );
				}

				return cartItems;
			},
			onRemoveItem: ( uuid ) => removeProductFromCart( uuid ),
		};

		return {
			cart,
			isNextDomainFree: shouldFirstDomainBeFree
				? domainItems.length === 0
				: responseCart.next_domain_is_free,
			items: domainItems,
		};
	}, [
		responseCart,
		removeProductFromCart,
		addProductsToCart,
		flowName,
		isFirstDomainFreeForFirstYear,
		flowAllowsMultipleDomainsInCart,
		onContinue,
		beforeAddDomainToCart,
	] );
};
