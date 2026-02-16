import { createRequestCartProduct, useShoppingCart } from '@automattic/shopping-cart';
import { useNavigate } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';
import type { CheckoutSearchParams } from '../app/router/checkout';
import type { RequestCartProduct, RequestCartProductExtra } from '@automattic/shopping-cart';

/**
 * Parses URL query parameters and adds the specified products and coupon to the
 * shopping cart when checkout loads.
 *
 * Supports comma-separated values for adding multiple products at once. The
 * nth value of each param corresponds to the nth product:
 *   - `productSlug` — required; the product slug(s)
 *   - `productMeta` — optional; e.g. a domain name for domain mapping products
 *   - `productQuantity` — optional; numeric quantity per product
 *   - `subscriptionId` — optional; when present, products are added as renewals
 *   - `coupon` — optional; a coupon code to apply
 *
 * Returns `true` while the cart update is in progress, `false` once complete
 * (or immediately when there is nothing to add).
 */
export function useAddProductsFromUrl( {
	siteId,
	productSlug,
	productMeta,
	productQuantity,
	subscriptionId,
	coupon,
}: { siteId: number } & CheckoutSearchParams ): boolean {
	const {
		addProductsToCart,
		applyCoupon,
		updateLocation,
		isLoading: isLoadingCart,
	} = useShoppingCart( siteId );
	const navigate = useNavigate();

	const hasWork = Boolean( productSlug || coupon );
	const [ isLoading, setIsLoading ] = useState( hasWork );
	const hasAdded = useRef( false );

	useEffect( () => {
		if ( ! hasWork || hasAdded.current || isLoadingCart ) {
			return;
		}

		hasAdded.current = true;

		const slugs = productSlug ? productSlug.split( ',' ) : [];
		const metas = productMeta ? productMeta.split( ',' ) : [];
		const quantities = productQuantity ? productQuantity.split( ',' ) : [];
		const subscriptionIds = subscriptionId ? subscriptionId.split( ',' ) : [];
		const isRenewal = subscriptionIds.length > 0;

		const productsForCart: RequestCartProduct[] = slugs
			.map( ( slug, index ) => {
				const meta = metas[ index ] ?? '';
				const rawQty = quantities[ index ];
				const quantity = rawQty ? parseInt( rawQty, 10 ) : null;
				const parsedQuantity = quantity !== null && ! isNaN( quantity ) ? quantity : null;

				if ( isRenewal ) {
					const purchaseId = subscriptionIds[ index ];
					if ( ! purchaseId ) {
						return null;
					}
					const extra: RequestCartProductExtra = {
						purchaseId,
						purchaseType: 'renewal',
					};
					return {
						product_slug: slug,
						meta: meta || '',
						quantity: parsedQuantity,
						volume: 1,
						extra,
					} as RequestCartProduct;
				}

				return createRequestCartProduct( {
					product_slug: slug,
					...( meta ? { meta } : {} ),
					quantity: parsedQuantity,
					extra: { context: 'calypstore' },
				} );
			} )
			.filter( ( p ): p is RequestCartProduct => p !== null );

		const promises: Promise< unknown >[] = [];

		if ( productsForCart.length > 0 ) {
			// Clear the tax location so taxes aren't calculated prematurely — the
			// checkout billing address step will prompt the user to confirm their
			// location before calculating taxes.
			promises.push( updateLocation( { countryCode: '' } ) );
			promises.push( addProductsToCart( productsForCart ) );
		}

		if ( coupon ) {
			promises.push( applyCoupon( coupon ) );
		}

		void Promise.allSettled( promises ).then( () => {
			// Remove the product/coupon params from the URL so a page refresh
			// doesn't re-add the same products to the cart.
			history.replaceState( null, '', window.location.pathname );
			setIsLoading( false );
		} );
	}, [
		hasWork,
		isLoadingCart,
		productSlug,
		productMeta,
		productQuantity,
		subscriptionId,
		coupon,
		addProductsToCart,
		applyCoupon,
		updateLocation,
		navigate,
	] );

	return isLoading;
}
