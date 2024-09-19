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
				return setReferredProducts( [] );
			}
			const allProducts = products
				.map( ( p ) => {
					return {
						...data.find( ( product ) => product.product_id === p.product_id ),
						quantity: 1,
					};
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
