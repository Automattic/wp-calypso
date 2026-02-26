import { useEffect, useState } from 'react';
import useFetchClientProducts from 'calypso/a8c-for-agencies/data/client/use-fetch-client-products';
import { ReferralProduct } from '../../client/types';
import { ShoppingCartItem } from '../types';

export default function useProductsById( products: ReferralProduct[] | [], isEnabled = true ) {
	const { data } = useFetchClientProducts( isEnabled );

	const [ referredProducts, setReferredProducts ] = useState< ShoppingCartItem[] | [] >( [] );

	useEffect( () => {
		if ( data ) {
			if ( ! products ) {
				setReferredProducts( [] );
			}
			const allProducts = products
				.map( ( p ) => {
					let matchedProduct: ShoppingCartItem | undefined;
					let matchedProductId: number | undefined;
					let matchedAlternativeProductId: number | undefined;

					const product = data.find( ( product ) => {
						if ( product.monthly_product_id === p.product_id ) {
							matchedProductId = product.monthly_product_id;
							matchedAlternativeProductId = product.monthly_alternative_product_id;
							return true;
						}
						if ( product.yearly_product_id === p.product_id ) {
							matchedProductId = product.yearly_product_id;
							matchedAlternativeProductId = product.yearly_alternative_product_id;
							return true;
						}
						if ( product.product_id === p.product_id ) {
							matchedProductId = product.product_id;
							matchedAlternativeProductId = product.alternative_product_id;
							return true;
						}
						return false;
					} );

					if ( product && matchedProductId !== undefined ) {
						matchedProduct = {
							...product,
							product_id: matchedProductId,
							alternative_product_id: matchedAlternativeProductId,
							quantity: 1,
						};
					}

					return matchedProduct;
				} )
				.filter( ( product ) => product ) as ShoppingCartItem[];

			// Only update if different to prevent unnecessary re-renders
			if ( JSON.stringify( allProducts ) !== JSON.stringify( referredProducts ) ) {
				setReferredProducts( allProducts );
			}
		}
	}, [ data, products, referredProducts ] );

	return {
		referredProducts,
	};
}
