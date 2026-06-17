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
import { ComponentProps, useMemo } from 'react';

const wpcomCartToDomainSearchCart = (
	domain: ResponseCartProduct,
	isEffectivelyFree: boolean,
	bundle?: { groupId: string; price: string; isPrimary: boolean }
) => {
	const [ domainName, ...tld ] = domain.meta.split( '.' );

	const hasPromotion =
		isEffectivelyFree ||
		domain.cost_overrides?.some( ( override ) => ! override.does_override_original_cost );

	const currentPrice = formatCurrency(
		isEffectivelyFree ? 0 : domain.item_subtotal_integer,
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
		bundle,
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

		// Bundle members never receive the free-domain promo: the server excludes
		// them from plan free-domain credit (the bundle discount doesn't stack),
		// so displaying one as free here would promise a price checkout won't honor.
		const firstNonPremiumDomain = domainItems.find(
			( item ) =>
				! isDomainMoveInternal( item ) &&
				! item.extra?.premium &&
				! item.extra?.domain_bundle_group_id
		);
		const freeDomainName = forceFirstNonPremiumDomainToBeFree
			? firstNonPremiumDomain?.meta
			: undefined;

		const rawTotal = domainItems.reduce(
			( acc, item ) => acc + ( freeDomainName === item.meta ? 0 : item.item_subtotal_integer ),
			0
		);
		const creditsInteger = responseCart.credits_integer ?? 0;
		const totalAfterCredits = Math.max( 0, rawTotal - creditsInteger );

		const total = formatCurrency( totalAfterCredits, responseCart.currency ?? 'USD', {
			isSmallestUnit: true,
			stripZeros: true,
		} );

		// Sum each bundle group's current prices so the domain-search cart panel
		// can render the group as a single row with one price. Bundle members are
		// never effectively free (they're excluded from the free-domain promo
		// above), so the sum is simply the members' subtotals.
		const bundleTotalsByGroup = new Map< string, number >();
		for ( const item of domainItems ) {
			const groupId = item.extra?.domain_bundle_group_id;
			if ( groupId ) {
				bundleTotalsByGroup.set(
					groupId,
					( bundleTotalsByGroup.get( groupId ) ?? 0 ) + item.item_subtotal_integer
				);
			}
		}

		const getBundleForItem = ( item: ResponseCartProduct ) => {
			const groupId = item.extra?.domain_bundle_group_id;
			if ( ! groupId ) {
				return undefined;
			}

			return {
				groupId,
				price: formatCurrency( bundleTotalsByGroup.get( groupId ) ?? 0, item.currency, {
					isSmallestUnit: true,
					stripZeros: true,
				} ),
				isPrimary: item.extra?.domain_bundle_role === 'primary',
			};
		};

		const cart: ComponentProps< typeof DomainSearch >[ 'cart' ] = {
			items: domainItems.map( ( domainItem ) => {
				const isCoveredByCredits =
					! forceFirstNonPremiumDomainToBeFree &&
					creditsInteger >= domainItem.item_subtotal_integer &&
					domainItem.meta === firstNonPremiumDomain?.meta;
				return wpcomCartToDomainSearchCart(
					domainItem,
					freeDomainName === domainItem.meta || isCoveredByCredits,
					getBundleForItem( domainItem )
				);
			} ),
			total,
			hasItem: ( domain ) => !! domainItems.find( ( item ) => item.meta === domain ),
			onAddItem: async ( { domain_name, product_slug, supports_privacy } ) => {
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
			},
			onAddBundle: async ( bundle ) => {
				// One product per bundle member, added in a single cart call so the
				// add is all-or-nothing. The bundle metadata is server-issued and
				// passed through verbatim — the backend cart validator verifies the
				// group id and applies the discount; no price math happens here.
				// Members arrive primary-first from the backend (the searched
				// SLD+TLD anchors the bundle), so the first member is the primary.
				const bundleProducts: MinimalRequestCartProduct[] = bundle.domains.map(
					( member, index ) => ( {
						product_slug: member.product_slug,
						meta: member.domain,
						extra: {
							...( member.supports_privacy && {
								privacy_available: member.supports_privacy,
								privacy: member.supports_privacy,
							} ),
							...( flowName && { flow_name: flowName } ),
							domain_bundle_group_id: bundle.bundle_group_id,
							domain_bundle_role: index === 0 ? ( 'primary' as const ) : ( 'companion' as const ),
							expected_bundle_size: String( bundle.domains.length ),
						},
					} )
				);

				// A bundle member may already sit in the cart as a standalone
				// product. The backend dedupes by product+meta keeping the last
				// occurrence, which would strip the bundle extras from the member —
				// so drop the standalone copy and let the bundle-tagged one win.
				const isBundleMember = ( product: ResponseCartProduct ) =>
					bundle.domains.some(
						( member ) =>
							member.product_slug === product.product_slug && member.domain === product.meta
					);

				const cartItems = await replaceProductsInCart( [
					...bundleProducts,
					...responseCart.products.filter( ( product ) => ! isBundleMember( product ) ),
				] );

				// The backend enforces bundle integrity by silently stripping an
				// incomplete group from the cart (e.g. a member became unavailable
				// between suggestion and add) rather than returning a cart error, so
				// the promise resolves even when the bundle didn't make it in. Turn
				// that absence into an error so the mutation captures the failure
				// instead of reporting success or continuing with a partial bundle.
				const bundleItemsInCart = cartItems.products.filter(
					( item ) => item.extra?.domain_bundle_group_id === bundle.bundle_group_id
				);

				if ( bundleItemsInCart.length < bundle.domains.length ) {
					throw new Error( 'The domain bundle could not be added to the cart.' );
				}

				if ( ! flowAllowsMultipleDomainsInCart ) {
					return onContinue( bundleItemsInCart );
				}

				return cartItems;
			},
			onRemoveItem: ( uuid ) => removeProductFromCart( uuid ),
			onRemoveBundle: ( bundleGroupId ) => {
				// Remove every member of the bundle in a single cart call so the
				// removal is all-or-nothing, mirroring how onAddBundle batches the
				// add. Serial per-member removals could leave orphaned members in
				// the cart if one of the calls fails.
				return replaceProductsInCart(
					responseCart.products.filter(
						( product ) => product.extra?.domain_bundle_group_id !== bundleGroupId
					)
				);
			},
		};

		return {
			cart,
			isNextDomainFree: forceFirstNonPremiumDomainToBeFree
				? freeDomainName === undefined
				: responseCart.next_domain_is_free,
			freeDomainName,
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
	] );
};
