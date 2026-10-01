import { activeAgencyQuery, agencyProductsQuery } from '@automattic/api-queries';
import { createRequestCartProduct, useShoppingCart } from '@automattic/shopping-cart';
import { useQuery } from '@tanstack/react-query';
import debugFactory from 'debug';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import { getBillingProductId } from './lib/billing-product-id';
import type { AgencyCartEntry } from './lib/agency-checkout-params';
import type { AgencyCheckoutTerm } from './lib/billing-product-id';
import type { TranslateResult } from 'i18n-calypso';

const debug = debugFactory( 'calypso:checkout:agency-siteless' );

const CART_TIMEOUT_MS = 30000;

/**
 * Fills the siteless WordPress.com cart from the dashboard's cart entries, one
 * line per unit so every WordPress.com site gets its own tier price, the way
 * the classic Billing Dragon checkout builds it. The agency and the billing
 * products come from the account of the user who is logged in, never from the
 * link.
 */
export default function useAgencyCart( entries: AgencyCartEntry[], term: AgencyCheckoutTerm ) {
	const translate = useTranslate();
	const [ isReady, setIsReady ] = useState( false );
	const [ error, setError ] = useState< TranslateResult | null >( null );
	const { replaceProductsInCart } = useShoppingCart( 'no-site' );

	const {
		data: agency,
		isSuccess: isAgencyLoaded,
		isError: isAgencyError,
	} = useQuery( activeAgencyQuery() );
	const agencyId = agency?.id ?? 0;
	const { data: products, isError: isProductsError } = useQuery( agencyProductsQuery( agencyId ) );

	useEffect( () => {
		if ( isReady || error ) {
			return;
		}
		if ( isAgencyError || ( isAgencyLoaded && ! agencyId ) ) {
			setError( translate( 'We could not find your agency.' ) );
			return;
		}
		if ( isProductsError ) {
			setError( translate( 'Failed to add products to cart.' ) );
			return;
		}
		if ( ! agencyId || ! products ) {
			return;
		}

		const productsToAdd = entries.flatMap( ( entry ) => {
			const product = products.find( ( candidate ) => candidate.slug === entry.slug );
			if ( ! product ) {
				return [];
			}
			return Array.from( { length: entry.quantity }, ( _, cartItemIndex ) =>
				createRequestCartProduct( {
					product_id: getBillingProductId( product, term ),
					product_slug: product.slug,
					extra: {
						isA4ASitelessCheckout: true,
						agency_id: agencyId,
						cart_item_index: cartItemIndex,
					},
				} )
			);
		} );

		if ( productsToAdd.length === 0 ) {
			setError( translate( 'Your cart is empty.' ) );
			return;
		}

		replaceProductsInCart( productsToAdd )
			.then( () => setIsReady( true ) )
			.catch( ( err ) => {
				debug( 'failed to fill the cart', err );
				setError( translate( 'Failed to add products to cart.' ) );
			} );
	}, [
		agencyId,
		entries,
		error,
		isAgencyError,
		isAgencyLoaded,
		isProductsError,
		isReady,
		products,
		replaceProductsInCart,
		term,
		translate,
	] );

	useEffect( () => {
		if ( isReady || error ) {
			return;
		}
		const timeoutId = setTimeout(
			() => setError( translate( 'Unable to load shopping cart.' ) ),
			CART_TIMEOUT_MS
		);
		return () => clearTimeout( timeoutId );
	}, [ isReady, error, translate ] );

	return { isReady, error };
}
