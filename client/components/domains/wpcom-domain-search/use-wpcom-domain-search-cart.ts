import {
	isDomainProduct,
	isDomainTransfer,
	isDomainMoveInternal,
	isPlan,
} from '@automattic/calypso-products';
import { DomainSearch } from '@automattic/domain-search';
import { formatCurrency } from '@automattic/number-formatters';
import {
	type CartKey,
	type MinimalRequestCartProduct,
	type ResponseCartProduct,
	useShoppingCart,
} from '@automattic/shopping-cart';
import { ComponentProps, useCallback, useEffect, useMemo, useState } from 'react';

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
	};
};

interface UseWPCOMDomainSearchCartOptions {
	cartKey: CartKey;
	flowName?: string;
	flowAllowsMultipleDomainsInCart: boolean;
	isFirstDomainFreeForFirstYear: boolean;
	onContinue( cartItems: ResponseCartProduct[] ): void;
	beforeAddDomainToCart?: ( domain: MinimalRequestCartProduct ) => MinimalRequestCartProduct;
}

export const useWPCOMDomainSearchCart = ( {
	cartKey,
	flowName,
	flowAllowsMultipleDomainsInCart,
	isFirstDomainFreeForFirstYear,
	onContinue,
	beforeAddDomainToCart = ( domain ) => domain,
}: UseWPCOMDomainSearchCartOptions ) => {
	const { responseCart, replaceProductsInCart, removeProductFromCart } = useShoppingCart( cartKey );

	// Tracks domains that have been clicked on but whose cart sync hasn't yet
	// completed. Treating these as "in cart" lets the CTA flip from "Add" to
	// "Continue" before the server roundtrip resolves; the entry is removed once
	// the real cart catches up or the sync errors out.
	const [ pendingAddedDomains, setPendingAddedDomains ] = useState< Set< string > >(
		() => new Set()
	);

	const removePendingDomain = useCallback( ( domain: string ) => {
		setPendingAddedDomains( ( prev ) => {
			if ( ! prev.has( domain ) ) {
				return prev;
			}
			const next = new Set( prev );
			next.delete( domain );
			return next;
		} );
	}, [] );

	// Once the server-confirmed cart contains a domain we were tracking
	// optimistically, drop the optimistic entry so the real cart is the source
	// of truth.
	useEffect( () => {
		if ( pendingAddedDomains.size === 0 ) {
			return;
		}
		const realDomainNames = new Set( responseCart.products.map( ( product ) => product.meta ) );
		setPendingAddedDomains( ( prev ) => {
			let next: Set< string > | undefined;
			prev.forEach( ( domain ) => {
				if ( realDomainNames.has( domain ) ) {
					if ( ! next ) {
						next = new Set( prev );
					}
					next.delete( domain );
				}
			} );
			return next ?? prev;
		} );
	}, [ responseCart.products, pendingAddedDomains ] );

	return useMemo( () => {
		const domainItems = flowAllowsMultipleDomainsInCart
			? responseCart.products.filter(
					( product ) => isDomainProduct( product ) || isDomainTransfer( product )
			  )
			: [];
		const isPlanInCart =
			responseCart.products.find( ( product ) => isPlan( product ) ) !== undefined;
		// If there's an annual plan in the cart, the backend will already set the first domain as free.
		// If there's a monthly plan in the cart, the backend will not set the first domain as free and
		// we'll also not set it as free here, which is correct since monthly plans don't have a free domain.
		// We have to check if there's a plan in the cart here since the user's cart might not be empty
		// when they start a domain search flow.
		const forceFirstNonPremiumDomainToBeFree = isFirstDomainFreeForFirstYear && ! isPlanInCart;

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

		const firstNonPremiumDomain = domainItems.find(
			( item ) => ! isDomainMoveInternal( item ) && ! item.extra?.premium
		);
		const freeDomainName = forceFirstNonPremiumDomainToBeFree
			? firstNonPremiumDomain?.meta
			: undefined;

		const total = formatCurrency(
			domainItems.reduce(
				( acc, item ) => acc + ( freeDomainName === item.meta ? 0 : item.item_subtotal_integer ),
				0
			),
			responseCart.currency ?? 'USD',
			{
				isSmallestUnit: true,
				stripZeros: true,
			}
		);

		const cart: ComponentProps< typeof DomainSearch >[ 'cart' ] = {
			items: domainItems.map( ( domainItem ) =>
				wpcomCartToDomainSearchCart( domainItem, freeDomainName === domainItem.meta )
			),
			total,
			hasItem: ( domain ) =>
				pendingAddedDomains.has( domain ) ||
				!! domainItems.find( ( item ) => item.meta === domain ),
			onAddItem: async ( { domain_name, product_slug, supports_privacy } ) => {
				setPendingAddedDomains( ( prev ) => {
					if ( prev.has( domain_name ) ) {
						return prev;
					}
					const next = new Set( prev );
					next.add( domain_name );
					return next;
				} );

				try {
					const cartItems = await replaceProductsInCart( [
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
						...responseCart.products,
					] );

					if ( ! flowAllowsMultipleDomainsInCart ) {
						return onContinue( cartItems.products.filter( ( item ) => item.meta === domain_name ) );
					}

					return cartItems;
				} catch ( error ) {
					removePendingDomain( domain_name );
					throw error;
				}
			},
			onRemoveItem: ( uuid ) => removeProductFromCart( uuid ),
		};

		return {
			cart,
			isNextDomainFree: forceFirstNonPremiumDomainToBeFree
				? freeDomainName === undefined
				: responseCart.next_domain_is_free,
			onContinue: () => onContinue( domainItems ),
		};
	}, [
		responseCart,
		removeProductFromCart,
		replaceProductsInCart,
		flowName,
		isFirstDomainFreeForFirstYear,
		flowAllowsMultipleDomainsInCart,
		onContinue,
		beforeAddDomainToCart,
		pendingAddedDomains,
		removePendingDomain,
	] );
};
