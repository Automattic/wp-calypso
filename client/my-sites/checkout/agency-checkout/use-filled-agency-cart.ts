import { activeAgencyQuery, agencyProductsQuery } from '@automattic/api-queries';
import { useShoppingCart } from '@automattic/shopping-cart';
import { useQuery } from '@tanstack/react-query';
import debugFactory from 'debug';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import type { AgencyProduct } from '@automattic/api-core';
import type { CartKey, RequestCartProduct } from '@automattic/shopping-cart';
import type { TranslateResult } from 'i18n-calypso';

const debug = debugFactory( 'calypso:checkout:agency' );

const CART_TIMEOUT_MS = 30000;

export type BuildAgencyCartLines = (
	agencyId: number,
	products: AgencyProduct[]
) => RequestCartProduct[];

/**
 * Fills a WordPress.com cart for the agency of the user who is logged in, out
 * of the products that agency can buy. `buildLines` turns them into the cart's
 * lines; no line means there is nothing to buy, reported as `emptyCartError`.
 */
export function useFilledAgencyCart(
	cartKey: CartKey,
	buildLines: BuildAgencyCartLines,
	emptyCartError: TranslateResult
) {
	const translate = useTranslate();
	const [ isReady, setIsReady ] = useState( false );
	const [ error, setError ] = useState< TranslateResult | null >( null );
	const { replaceProductsInCart } = useShoppingCart( cartKey );

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

		const productsToAdd = buildLines( agencyId, products );
		if ( productsToAdd.length === 0 ) {
			setError( emptyCartError );
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
		buildLines,
		emptyCartError,
		error,
		isAgencyError,
		isAgencyLoaded,
		isProductsError,
		isReady,
		products,
		replaceProductsInCart,
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
