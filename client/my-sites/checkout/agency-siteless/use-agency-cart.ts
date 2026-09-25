import { createRequestCartProduct, useShoppingCart } from '@automattic/shopping-cart';
import debugFactory from 'debug';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import type { AgencyCartEntry } from './lib/agency-checkout-params';
import type { TranslateResult } from 'i18n-calypso';

const debug = debugFactory( 'calypso:checkout:agency-siteless' );

const CART_TIMEOUT_MS = 30000;

/**
 * Fills the siteless WordPress.com cart from the dashboard's cart entries, one
 * line per unit so every WordPress.com site gets its own tier price, the way
 * the classic Billing Dragon checkout builds it. The dashboard resolves the
 * billing product ids up front: the agency endpoints only answer the A4A
 * OAuth apps, not the WordPress.com session this page runs under.
 */
export default function useAgencyCart( agencyId: number, entries: AgencyCartEntry[] ) {
	const translate = useTranslate();
	const [ isReady, setIsReady ] = useState( false );
	const [ error, setError ] = useState< TranslateResult | null >( null );
	const { replaceProductsInCart } = useShoppingCart( 'no-site' );

	useEffect( () => {
		if ( isReady || error ) {
			return;
		}
		if ( ! agencyId ) {
			setError( translate( 'We could not find your agency.' ) );
			return;
		}
		if ( entries.length === 0 ) {
			setError( translate( 'Your cart is empty.' ) );
			return;
		}

		const productsToAdd = entries.flatMap( ( entry ) =>
			Array.from( { length: entry.quantity }, ( _, cartItemIndex ) =>
				createRequestCartProduct( {
					product_id: entry.productId,
					product_slug: entry.slug,
					extra: {
						isA4ASitelessCheckout: true,
						agency_id: agencyId,
						cart_item_index: cartItemIndex,
					},
				} )
			)
		);

		replaceProductsInCart( productsToAdd )
			.then( () => setIsReady( true ) )
			.catch( ( err ) => {
				debug( 'failed to fill the cart', err );
				setError( translate( 'Failed to add products to cart.' ) );
			} );
	}, [ agencyId, entries, error, isReady, replaceProductsInCart, translate ] );

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
